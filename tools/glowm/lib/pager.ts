import { ANSI } from './ansi'
import type { Line } from './lines'
import type { Match } from './search'
import { highlightLine } from './search'

type ImageData = {
  buffer: Buffer
  alt: string
}

export type PagerState = {
  lines: Line[]
  images: Map<string, ImageData>
  topLine: number
  termHeight: number
  termWidth: number
  searchPattern: string | null
  searchMatches: Match[]
  searchIndex: number
}

export function createPagerState(
  lines: Line[],
  images: Map<string, ImageData>,
  termHeight: number,
  termWidth: number
): PagerState {
  return {
    lines,
    images,
    topLine: 0,
    termHeight,
    termWidth,
    searchPattern: null,
    searchMatches: [],
    searchIndex: -1,
  }
}

/** Scroll by delta lines, clamping to bounds. */
export function scroll(state: PagerState, delta: number): void {
  const viewportHeight = state.termHeight - 1 // Reserve 1 line for prompt
  const maxTop = Math.max(0, state.lines.length - viewportHeight)

  state.topLine = Math.max(0, Math.min(maxTop, state.topLine + delta))
}

/** Jump to specific line. */
export function goTo(state: PagerState, line: number): void {
  const viewportHeight = state.termHeight - 1
  const maxTop = Math.max(0, state.lines.length - viewportHeight)

  state.topLine = Math.max(0, Math.min(maxTop, line))
}

/** Check if at end of content. */
export function isAtEnd(state: PagerState): boolean {
  const viewportHeight = state.termHeight - 1
  return state.topLine + viewportHeight >= state.lines.length
}

/** Render current viewport to string (for testing). */
export function renderViewport(state: PagerState): string {
  const viewportHeight = state.termHeight - 1
  const endLine = Math.min(state.topLine + viewportHeight, state.lines.length)

  let output = ANSI.clearScreen + ANSI.cursorHome

  for (let i = state.topLine; i < endLine; i++) {
    const line = state.lines[i]!

    if (line.imageRef) {
      // Image placeholder - will be rendered separately in actual pager
      output += `[Image]\n`
    } else {
      let content = line.content
      // Apply search highlighting
      if (state.searchMatches.length > 0) {
        content = highlightLine(content, state.searchMatches, i)
      }
      output += content + '\n'
    }
  }

  // Prompt line
  output += isAtEnd(state) ? '(END)' : ':'

  return output
}

/** Format info line for = command. */
export function formatInfo(state: PagerState): string {
  if (state.lines.length === 0) {
    return 'lines 0-0/0 (0%)'
  }

  const viewportHeight = state.termHeight - 1
  const endLine = Math.min(state.topLine + viewportHeight, state.lines.length)
  const percent = Math.round((endLine / state.lines.length) * 100)

  return `lines ${state.topLine + 1}-${endLine}/${state.lines.length} (${percent}%)`
}
