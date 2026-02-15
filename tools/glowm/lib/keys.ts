// lib/keys.ts

export const KEY = {
  UP: 'up',
  DOWN: 'down',
  SCROLL_UP: 'scroll_up',
  SCROLL_DOWN: 'scroll_down',
  PAGE_UP: 'page_up',
  PAGE_DOWN: 'page_down',
  HALF_UP: 'half_up',
  HALF_DOWN: 'half_down',
  TOP: 'top',
  BOTTOM: 'bottom',
  SEARCH: 'search',
  SEARCH_BACK: 'search_back',
  NEXT_HEADER: 'next_header',
  PREV_HEADER: 'prev_header',
  INFO: 'info',
  QUIT: 'quit',
  ENTER: 'enter',
  UNKNOWN: 'unknown',
} as const

export type KeyAction = (typeof KEY)[keyof typeof KEY]

const KEY_MAP: Record<string, KeyAction> = {
  // Scroll down
  'j': KEY.DOWN,
  '\x1b[B': KEY.DOWN, // Down arrow
  '\r': KEY.ENTER, // Enter (also scrolls down)
  '\n': KEY.ENTER,

  // Scroll up
  'k': KEY.UP,
  '\x1b[A': KEY.UP, // Up arrow

  // Page down
  ' ': KEY.PAGE_DOWN,
  'f': KEY.PAGE_DOWN,
  '\x06': KEY.PAGE_DOWN, // Ctrl+F
  '\x1b[6~': KEY.PAGE_DOWN, // Page Down key

  // Page up
  'b': KEY.PAGE_UP,
  '\x02': KEY.PAGE_UP, // Ctrl+B
  '\x1b[5~': KEY.PAGE_UP, // Page Up key

  // Half page
  'd': KEY.HALF_DOWN,
  '\x04': KEY.HALF_DOWN, // Ctrl+D
  'u': KEY.HALF_UP,
  '\x15': KEY.HALF_UP, // Ctrl+U

  // Jump
  'g': KEY.TOP,
  '\x1b[H': KEY.TOP, // Home key
  'G': KEY.BOTTOM,
  '\x1b[F': KEY.BOTTOM, // End key

  // Search
  '/': KEY.SEARCH,
  '?': KEY.SEARCH_BACK,

  // Header navigation
  'n': KEY.NEXT_HEADER,
  'N': KEY.PREV_HEADER,

  // Info
  '=': KEY.INFO,
  '\x07': KEY.INFO, // Ctrl+G

  // Quit
  'q': KEY.QUIT,
  '\x03': KEY.QUIT, // Ctrl+C
}

// SGR mouse scroll: \x1b[<64;col;rowM (up) or \x1b[<65;col;rowM (down)
const MOUSE_SCROLL_REGEX = /^\x1b\[<(64|65);\d+;\d+M$/

/** Parse raw key input into action. */
export function parseKey(data: string): KeyAction {
  // Check for mouse scroll first
  const mouseMatch = data.match(MOUSE_SCROLL_REGEX)
  if (mouseMatch) {
    return mouseMatch[1] === '64' ? KEY.SCROLL_UP : KEY.SCROLL_DOWN
  }
  return KEY_MAP[data] ?? KEY.UNKNOWN
}
