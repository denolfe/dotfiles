import { describe, expect, test } from 'bun:test'
import {
  stripAnsi,
  visibleLength,
  buildPositionMap,
  injectHighlight,
  ANSI,
} from './ansi'

describe('stripAnsi', () => {
  test('removes color codes', () => {
    expect(stripAnsi('\x1b[31mred\x1b[0m')).toBe('red')
  })

  test('handles multiple codes', () => {
    expect(stripAnsi('\x1b[1m\x1b[31mbold red\x1b[0m')).toBe('bold red')
  })

  test('returns plain text unchanged', () => {
    expect(stripAnsi('plain')).toBe('plain')
  })
})

describe('visibleLength', () => {
  test('ignores ANSI codes in length calculation', () => {
    expect(visibleLength('\x1b[31mred\x1b[0m')).toBe(3)
  })

  test('counts visible characters only', () => {
    expect(visibleLength('\x1b[1m\x1b[31mAB\x1b[0m')).toBe(2)
  })
})

describe('buildPositionMap', () => {
  test('maps visible positions to ANSI positions', () => {
    const map = buildPositionMap('\x1b[31mABC\x1b[0m')
    // visible index 0 (A) -> ansi index 5 (after \x1b[31m)
    expect(map[0]).toBe(5)
    expect(map[1]).toBe(6)
    expect(map[2]).toBe(7)
  })

  test('handles plain text', () => {
    const map = buildPositionMap('ABC')
    expect(map[0]).toBe(0)
    expect(map[1]).toBe(1)
    expect(map[2]).toBe(2)
  })
})

describe('injectHighlight', () => {
  test('wraps range in inverse video', () => {
    const result = injectHighlight('hello world', 0, 5)
    expect(result).toBe('\x1b[7mhello\x1b[27m world')
  })

  test('works with ANSI-colored text', () => {
    const input = '\x1b[31mhello\x1b[0m world'
    const result = injectHighlight(input, 0, 5)
    // Should highlight "hello" (visible positions 0-4)
    expect(result).toContain('\x1b[7m')
    expect(result).toContain('\x1b[27m')
    expect(stripAnsi(result)).toBe('hello world')
  })
})

describe('ANSI escape sequences', () => {
  test('clearScreen is defined', () => {
    expect(ANSI.clearScreen).toBe('\x1b[2J')
  })

  test('cursorHome is defined', () => {
    expect(ANSI.cursorHome).toBe('\x1b[H')
  })

  test('cursorHide is defined', () => {
    expect(ANSI.cursorHide).toBe('\x1b[?25l')
  })

  test('cursorShow is defined', () => {
    expect(ANSI.cursorShow).toBe('\x1b[?25h')
  })
})
