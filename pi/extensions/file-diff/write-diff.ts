// Line-diff synthesis derived from pi-tool-display 0.5.0 by MasuRii (MIT). See ./LICENSE.

export type WriteDiffGuard = {
  previousLineCount: number
  nextLineCount: number
}

type WriteDiffOperationKind = 'context' | 'remove' | 'add'

type WriteDiffOperation = {
  kind: WriteDiffOperationKind
  content: string
}

/** Longest-common-subsequence cost grows with previous x next lines, so both are bounded. */
const MAX_WRITE_DIFF_LINES = 4000
const MAX_WRITE_DIFF_MATRIX_CELLS = 1_000_000

const LINE_MARKERS: Record<WriteDiffOperationKind, string> = {
  context: ' ',
  remove: '-',
  add: '+',
}

export function splitWriteContentLines(content: string): string[] {
  if (!content) return []

  const lines = content.replace(/\r/g, '').split('\n')
  if (lines.at(-1) === '') lines.pop()
  return lines
}

export function countWriteContentLines(value: unknown): number {
  return typeof value === 'string' ? splitWriteContentLines(value).length : 0
}

export function getWriteContentSizeBytes(value: unknown): number {
  return typeof value === 'string' ? Buffer.byteLength(value, 'utf8') : 0
}

/** Returns the guard when a line diff would be too large to compute, otherwise undefined. */
export function resolveWriteDiffGuard(params: {
  previousLines: string[]
  nextLines: string[]
}): WriteDiffGuard | undefined {
  const previousLineCount = params.previousLines.length
  const nextLineCount = params.nextLines.length
  const guard = { previousLineCount, nextLineCount }

  if (previousLineCount > MAX_WRITE_DIFF_LINES || nextLineCount > MAX_WRITE_DIFF_LINES) return guard
  if (previousLineCount === 0 || nextLineCount === 0) return undefined
  return previousLineCount * nextLineCount > MAX_WRITE_DIFF_MATRIX_CELLS ? guard : undefined
}

/** Builds a single-hunk unified diff so written files render through the shared diff pipeline. */
export function buildWriteUnifiedDiff(params: { previousLines: string[]; nextLines: string[] }): string {
  const { previousLines, nextLines } = params
  const operations = previousLines.length === 0
    ? nextLines.map((content): WriteDiffOperation => ({ kind: 'add', content }))
    : buildWriteDiffOperations(previousLines, nextLines)
  if (operations.length === 0) return ''

  const oldStart = previousLines.length === 0 ? 0 : 1
  const newStart = nextLines.length === 0 ? 0 : 1
  const header = `@@ -${oldStart},${previousLines.length} +${newStart},${nextLines.length} @@`
  return [header, ...operations.map((operation) => `${LINE_MARKERS[operation.kind]}${operation.content}`)].join('\n')
}

function buildWriteDiffOperations(oldLines: string[], newLines: string[]): WriteDiffOperation[] {
  const oldLength = oldLines.length
  const newLength = newLines.length
  const table: number[][] = Array.from({ length: oldLength + 1 }, () => Array<number>(newLength + 1).fill(0))

  for (let oldIndex = 1; oldIndex <= oldLength; oldIndex++) {
    for (let newIndex = 1; newIndex <= newLength; newIndex++) {
      if ((oldLines[oldIndex - 1] ?? '') === (newLines[newIndex - 1] ?? '')) {
        table[oldIndex]![newIndex] = (table[oldIndex - 1]?.[newIndex - 1] ?? 0) + 1
        continue
      }
      const top = table[oldIndex - 1]?.[newIndex] ?? 0
      const left = table[oldIndex]?.[newIndex - 1] ?? 0
      table[oldIndex]![newIndex] = Math.max(top, left)
    }
  }

  const operations: WriteDiffOperation[] = []
  let oldCursor = oldLength
  let newCursor = newLength

  while (oldCursor > 0 || newCursor > 0) {
    const oldLine = oldCursor > 0 ? (oldLines[oldCursor - 1] ?? '') : undefined
    const newLine = newCursor > 0 ? (newLines[newCursor - 1] ?? '') : undefined

    if (oldCursor > 0 && newCursor > 0 && oldLine === newLine) {
      operations.push({ kind: 'context', content: oldLine ?? '' })
      oldCursor--
      newCursor--
      continue
    }

    const top = oldCursor > 0 ? (table[oldCursor - 1]?.[newCursor] ?? 0) : -1
    const left = newCursor > 0 ? (table[oldCursor]?.[newCursor - 1] ?? 0) : -1

    if (newCursor > 0 && left >= top) {
      operations.push({ kind: 'add', content: newLine ?? '' })
      newCursor--
      continue
    }

    if (oldCursor > 0) {
      operations.push({ kind: 'remove', content: oldLine ?? '' })
      oldCursor--
    }
  }

  operations.reverse()
  return operations
}
