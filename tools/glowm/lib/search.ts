import { stripAnsi, injectHighlight } from './ansi'
import type { Line } from './lines'

export type Match = {
  lineIndex: number
  start: number // visible char index
  end: number // visible char index (exclusive)
}

/**
 * Find all matches of pattern in lines.
 * Searches visible text (ignoring ANSI codes).
 */
export function findMatches(lines: Line[], pattern: string): Match[] {
  if (!pattern) return []

  const matches: Match[] = []
  const regex = new RegExp(escapeRegex(pattern), 'gi')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.imageRef) continue // Skip image lines

    const visible = stripAnsi(line.content)
    let match: RegExpExecArray | null

    while ((match = regex.exec(visible)) !== null) {
      matches.push({
        lineIndex: i,
        start: match.index,
        end: match.index + match[0].length,
      })
    }
  }

  return matches
}

/**
 * Apply highlight to all matches on a specific line.
 */
export function highlightLine(content: string, matches: Match[], lineIndex: number): string {
  const lineMatches = matches
    .filter((m) => m.lineIndex === lineIndex)
    .sort((a, b) => b.start - a.start) // Process from end to preserve indices

  let result = content
  for (const match of lineMatches) {
    result = injectHighlight(result, match.start, match.end)
  }

  return result
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
