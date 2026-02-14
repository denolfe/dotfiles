import { ANSI } from './ansi'
import { parseKey, KEY } from './keys'
import type { Line } from './lines'
import { splitIntoLines } from './lines'
import type { Match } from './search'
import { findMatches, highlightLine } from './search'

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

/**
 * Run interactive pager. Returns when user quits.
 */
export async function runPager(
  content: string,
  images: Map<string, ImageData>
): Promise<void> {
  const termHeight = process.stdout.rows || 24
  const termWidth = process.stdout.columns || 80

  const lines = splitIntoLines(content, termWidth)
  const state = createPagerState(lines, images, termHeight, termWidth)

  // Set up raw mode
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true)
  }
  process.stdin.resume()
  process.stdout.write(ANSI.cursorHide)

  // Initial render
  render(state)

  return new Promise<void>((resolve) => {
    const handleKey = async (data: Buffer) => {
      const key = parseKey(data.toString())
      const viewportHeight = state.termHeight - 1

      switch (key) {
        case KEY.DOWN:
        case KEY.ENTER:
          scroll(state, 1)
          break
        case KEY.UP:
          scroll(state, -1)
          break
        case KEY.PAGE_DOWN:
          scroll(state, viewportHeight)
          break
        case KEY.PAGE_UP:
          scroll(state, -viewportHeight)
          break
        case KEY.HALF_DOWN:
          scroll(state, Math.floor(viewportHeight / 2))
          break
        case KEY.HALF_UP:
          scroll(state, -Math.floor(viewportHeight / 2))
          break
        case KEY.TOP:
          goTo(state, 0)
          break
        case KEY.BOTTOM:
          goTo(state, state.lines.length)
          break
        case KEY.SEARCH:
          await handleSearch(state, 'forward')
          break
        case KEY.SEARCH_BACK:
          await handleSearch(state, 'backward')
          break
        case KEY.NEXT_MATCH:
          jumpToMatch(state, 1)
          break
        case KEY.PREV_MATCH:
          jumpToMatch(state, -1)
          break
        case KEY.INFO:
          showInfo(state)
          return // Don't re-render, info shows on prompt line
        case KEY.QUIT:
          cleanup()
          resolve()
          return
      }

      render(state)
    }

    const cleanup = () => {
      process.stdin.removeListener('data', handleKey)
      process.stdin.pause()
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false)
      }
      process.stdout.write(ANSI.cursorShow)
      process.stdout.write(ANSI.clearScreen + ANSI.cursorHome)
    }

    process.stdin.on('data', handleKey)
  })
}

/** Render current state to terminal. */
function render(state: PagerState): void {
  const output = renderViewport(state)
  process.stdout.write(output)
}

/** Handle search input. */
async function handleSearch(
  state: PagerState,
  direction: 'forward' | 'backward'
): Promise<void> {
  const prompt = direction === 'forward' ? '/' : '?'

  // Show search prompt
  process.stdout.write(
    ANSI.cursorTo(state.termHeight, 1) + ANSI.eraseLine + prompt
  )
  process.stdout.write(ANSI.cursorShow)

  const pattern = await readLine()

  process.stdout.write(ANSI.cursorHide)

  if (pattern) {
    state.searchPattern = pattern
    state.searchMatches = findMatches(state.lines, pattern)
    state.searchIndex = -1

    if (state.searchMatches.length > 0) {
      // Jump to first match (or last for backward)
      if (direction === 'forward') {
        jumpToMatch(state, 1)
      } else {
        state.searchIndex = state.searchMatches.length
        jumpToMatch(state, -1)
      }
    }
  }
}

/** Read a line of input from user. */
function readLine(): Promise<string> {
  return new Promise((resolve) => {
    let buffer = ''

    const handler = (data: Buffer) => {
      const char = data.toString()

      if (char === '\r' || char === '\n') {
        process.stdin.removeListener('data', handler)
        resolve(buffer)
      } else if (char === '\x7f' || char === '\x08') {
        // Backspace
        if (buffer.length > 0) {
          buffer = buffer.slice(0, -1)
          process.stdout.write('\b \b')
        }
      } else if (char === '\x1b' || char === '\x03') {
        // Escape or Ctrl+C - cancel
        process.stdin.removeListener('data', handler)
        resolve('')
      } else if (char >= ' ') {
        buffer += char
        process.stdout.write(char)
      }
    }

    process.stdin.on('data', handler)
  })
}

/** Jump to next/prev search match. */
function jumpToMatch(state: PagerState, direction: 1 | -1): void {
  if (state.searchMatches.length === 0) return

  state.searchIndex += direction

  // Wrap around
  if (state.searchIndex >= state.searchMatches.length) {
    state.searchIndex = 0
  } else if (state.searchIndex < 0) {
    state.searchIndex = state.searchMatches.length - 1
  }

  const match = state.searchMatches[state.searchIndex]!
  goTo(state, match.lineIndex)
}

/** Show info on prompt line. */
function showInfo(state: PagerState): void {
  const info = formatInfo(state)
  process.stdout.write(ANSI.cursorTo(state.termHeight, 1) + ANSI.eraseLine + info)
}
