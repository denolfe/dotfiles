import { describe, expect, test } from 'bun:test'
import { findMatches, highlightLine } from './search'
import type { Line } from './lines'

describe('findMatches', () => {
  test('finds matches across lines', () => {
    const lines: Line[] = [
      { content: 'hello world', imageRef: undefined },
      { content: 'world hello', imageRef: undefined },
    ]
    const matches = findMatches(lines, 'hello')

    expect(matches.length).toBe(2)
    expect(matches[0]).toEqual({ lineIndex: 0, start: 0, end: 5 })
    expect(matches[1]).toEqual({ lineIndex: 1, start: 6, end: 11 })
  })

  test('finds multiple matches on same line', () => {
    const lines: Line[] = [{ content: 'foo bar foo', imageRef: undefined }]
    const matches = findMatches(lines, 'foo')

    expect(matches.length).toBe(2)
    expect(matches[0]).toEqual({ lineIndex: 0, start: 0, end: 3 })
    expect(matches[1]).toEqual({ lineIndex: 0, start: 8, end: 11 })
  })

  test('ignores image placeholder lines', () => {
    const lines: Line[] = [
      { content: 'hello', imageRef: undefined },
      { content: '\x00IMG:0\x00', imageRef: '\x00IMG:0\x00' },
      { content: 'hello', imageRef: undefined },
    ]
    const matches = findMatches(lines, 'hello')

    expect(matches.length).toBe(2)
    expect(matches[0]!.lineIndex).toBe(0)
    expect(matches[1]!.lineIndex).toBe(2)
  })

  test('case insensitive by default', () => {
    const lines: Line[] = [{ content: 'Hello HELLO hello', imageRef: undefined }]
    const matches = findMatches(lines, 'hello')

    expect(matches.length).toBe(3)
  })

  test('returns empty array for no matches', () => {
    const lines: Line[] = [{ content: 'hello world', imageRef: undefined }]
    const matches = findMatches(lines, 'xyz')

    expect(matches).toEqual([])
  })

  test('searches visible text ignoring ANSI codes', () => {
    const lines: Line[] = [{ content: '\x1b[31mhello\x1b[0m', imageRef: undefined }]
    const matches = findMatches(lines, 'hello')

    expect(matches.length).toBe(1)
    expect(matches[0]).toEqual({ lineIndex: 0, start: 0, end: 5 })
  })
})

describe('highlightLine', () => {
  test('highlights matches on line', () => {
    const result = highlightLine('hello world', [{ lineIndex: 0, start: 0, end: 5 }], 0)
    expect(result).toContain('\x1b[7m')
    expect(result).toContain('hello')
  })

  test('highlights multiple matches', () => {
    const matches = [
      { lineIndex: 0, start: 0, end: 3 },
      { lineIndex: 0, start: 8, end: 11 },
    ]
    const result = highlightLine('foo bar foo', matches, 0)
    // Both "foo" should be highlighted
    expect((result.match(/\x1b\[7m/g) || []).length).toBe(2)
  })

  test('returns original if no matches for this line', () => {
    const result = highlightLine('hello', [{ lineIndex: 1, start: 0, end: 5 }], 0)
    expect(result).toBe('hello')
  })
})
