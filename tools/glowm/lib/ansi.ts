const ANSI_REGEX = /\x1b\[[0-9;]*m/g

/** ANSI escape sequences for terminal control. */
export const ANSI = {
  clearScreen: '\x1b[2J',
  cursorHome: '\x1b[H',
  cursorHide: '\x1b[?25l',
  cursorShow: '\x1b[?25h',
  cursorTo: (row: number, col: number) => `\x1b[${row};${col}H`,
  eraseLine: '\x1b[2K',
  highlightStart: '\x1b[7m', // Inverse video
  highlightEnd: '\x1b[27m',
  mouseOn: '\x1b[?1000h\x1b[?1006h', // Enable SGR mouse mode
  mouseOff: '\x1b[?1000l\x1b[?1006l', // Disable SGR mouse mode
} as const

/** Strip ANSI escape codes from string. */
export function stripAnsi(s: string): string {
  return s.replace(ANSI_REGEX, '')
}

/** Get visible length of string (excluding ANSI codes). */
export function visibleLength(s: string): number {
  return stripAnsi(s).length
}

/**
 * Build map from visible character index to ANSI string index.
 * Returns array where map[visibleIdx] = ansiIdx.
 */
export function buildPositionMap(s: string): number[] {
  const map: number[] = []
  let visibleIdx = 0
  let i = 0

  while (i < s.length) {
    // Check for ANSI escape sequence
    const match = s.slice(i).match(/^\x1b\[[0-9;]*m/)
    if (match) {
      i += match[0].length
      continue
    }
    map[visibleIdx] = i
    visibleIdx++
    i++
  }

  return map
}

/**
 * Inject highlight (inverse video) around visible character range.
 * @param s - String possibly containing ANSI codes
 * @param start - Start visible index (inclusive)
 * @param end - End visible index (exclusive)
 */
export function injectHighlight(s: string, start: number, end: number): string {
  const map = buildPositionMap(s)
  if (start >= map.length || end > map.length) return s

  const ansiStart = map[start]!
  const ansiEnd = end < map.length ? map[end]! : s.length

  return (
    s.slice(0, ansiStart) +
    ANSI.highlightStart +
    s.slice(ansiStart, ansiEnd) +
    ANSI.highlightEnd +
    s.slice(ansiEnd)
  )
}
