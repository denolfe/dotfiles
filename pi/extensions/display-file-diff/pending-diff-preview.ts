import { readWorkspaceUtf8File } from './workspace-file'

export type PendingDiffPreviewData = {
  filePath: string
  previousContent?: string
  nextContent?: string
  fileExistedBeforeWrite: boolean
  headerLabel: 'pending edit' | 'pending overwrite' | 'pending create'
  notice?: string
}

type EditReplacement = {
  oldText: string
  newText: string
}

type ProjectedEditResult =
  | { ok: true; content: string }
  | { ok: false; reason: string }

export function buildPendingWritePreviewData(input: unknown, cwd: string): PendingDiffPreviewData | undefined {
  const filePath = pathArgument(input)
  const nextContent = stringField(input, 'content')
  if (!filePath || nextContent === undefined) return undefined

  const existing = readWorkspaceUtf8File({ cwd, path: filePath })
  return {
    filePath,
    previousContent: existing.content,
    nextContent,
    fileExistedBeforeWrite: existing.exists,
    headerLabel: existing.exists ? 'pending overwrite' : 'pending create',
    notice: existing.error,
  }
}

export function buildPendingEditPreviewData(
  input: unknown,
  cwd: string,
  options: { isPartialArguments?: boolean } = {},
): PendingDiffPreviewData | undefined {
  const filePath = pathArgument(input)
  if (!filePath) return undefined

  const existing = readWorkspaceUtf8File({ cwd, path: filePath })
  if (existing.error) return editNotice(filePath, existing.error)
  if (!existing.exists || existing.content === undefined) {
    return editNotice(filePath, 'Preview unavailable because the target file does not exist yet.')
  }

  const projected = projectEditContent({
    originalContent: existing.content,
    replacements: editReplacements(input),
    isPartialArguments: options.isPartialArguments ?? false,
  })
  if (!projected.ok) {
    return {
      ...editNotice(filePath, projected.reason),
      previousContent: existing.content,
      fileExistedBeforeWrite: true,
    }
  }

  return {
    filePath,
    previousContent: existing.content,
    nextContent: projected.content,
    fileExistedBeforeWrite: true,
    headerLabel: 'pending edit',
  }
}

function projectEditContent(params: {
  originalContent: string
  replacements: EditReplacement[]
  isPartialArguments: boolean
}): ProjectedEditResult {
  const { originalContent, replacements, isPartialArguments } = params
  if (replacements.length === 0) {
    return { ok: false, reason: 'Preview not shown: the edit request did not include exact replacement blocks.' }
  }

  const { bom, text } = stripBom(originalContent)
  const lineEnding = detectLineEnding(text)
  const normalizedContent = normalizeLineEndings(text)
  const ranges: Array<{ start: number; end: number; replacement: string }> = []

  for (const [index, replacement] of replacements.entries()) {
    const oldText = normalizeLineEndings(replacement.oldText)
    const newText = normalizeLineEndings(replacement.newText)
    if (!oldText) return { ok: false, reason: `Preview not shown: edit #${index + 1} has an empty oldText block.` }

    const matches = countMatches(normalizedContent, oldText)
    if (matches !== 1) {
      return {
        ok: false,
        reason: matches === 0
          ? `Preview not shown: edit #${index + 1} did not match the current file contents.`
          : `Preview not shown: edit #${index + 1} matched ${matches} regions instead of exactly one.`,
      }
    }

    const start = normalizedContent.indexOf(oldText)
    ranges.push({ start, end: start + oldText.length, replacement: newText })
  }

  ranges.sort((left, right) => left.start - right.start)
  for (let index = 1; index < ranges.length; index++) {
    if (ranges[index]!.start < ranges[index - 1]!.end) {
      return { ok: false, reason: 'Preview not shown: the requested edits overlap in the original file.' }
    }
  }

  let cursor = 0
  let output = ''
  for (const [index, range] of ranges.entries()) {
    output += normalizedContent.slice(cursor, range.start)
    output += range.replacement
    const nextStart = ranges[index + 1]?.start ?? normalizedContent.length
    // Incomplete replacement text preserves a boundary before unchanged following text.
    if (isPartialArguments && range.end < nextStart
      && normalizedContent[range.end - 1] === '\n' && !range.replacement.endsWith('\n')) {
      output += '\n'
    }
    cursor = range.end
  }
  output += normalizedContent.slice(cursor)

  return { ok: true, content: `${bom}${restoreLineEndings(output, lineEnding)}` }
}

function editNotice(filePath: string, notice: string): PendingDiffPreviewData {
  return {
    filePath,
    fileExistedBeforeWrite: false,
    headerLabel: 'pending edit',
    notice,
  }
}

function editReplacements(input: unknown): EditReplacement[] {
  const record = objectRecord(input)
  if (Array.isArray(record.edits)) {
    return record.edits.flatMap((entry) => {
      const edit = objectRecord(entry)
      return typeof edit.oldText === 'string' && typeof edit.newText === 'string'
        ? [{ oldText: edit.oldText, newText: edit.newText }]
        : []
    })
  }

  return typeof record.oldText === 'string' && typeof record.newText === 'string'
    ? [{ oldText: record.oldText, newText: record.newText }]
    : []
}

function pathArgument(input: unknown): string | undefined {
  const record = objectRecord(input)
  const value = record.path ?? record.file_path
  if (typeof value !== 'string') return undefined
  return value.trim() || undefined
}

function stringField(input: unknown, key: string): string | undefined {
  const value = objectRecord(input)[key]
  return typeof value === 'string' ? value : undefined
}

function objectRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function countMatches(haystack: string, needle: string): number {
  let count = 0
  let cursor = 0
  while (cursor <= haystack.length) {
    const index = haystack.indexOf(needle, cursor)
    if (index === -1) break
    count++
    cursor = index + 1
  }
  return count
}

function stripBom(content: string): { bom: string; text: string } {
  return content.startsWith('\uFEFF')
    ? { bom: '\uFEFF', text: content.slice(1) }
    : { bom: '', text: content }
}

function detectLineEnding(content: string): '\r\n' | '\n' {
  const crlfIndex = content.indexOf('\r\n')
  const lfIndex = content.indexOf('\n')
  return crlfIndex !== -1 && (lfIndex === -1 || crlfIndex < lfIndex) ? '\r\n' : '\n'
}

function normalizeLineEndings(content: string): string {
  return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

function restoreLineEndings(content: string, lineEnding: '\r\n' | '\n'): string {
  return lineEnding === '\r\n' ? content.replace(/\n/g, '\r\n') : content
}
