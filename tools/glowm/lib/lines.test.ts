import { describe, expect, test } from 'bun:test'
import { splitIntoLines, wrapLine } from './lines'

describe('wrapLine', () => {
  test('returns single line if fits', () => {
    const result = wrapLine('short', 80)
    expect(result).toEqual(['short'])
  })

  test('wraps long line at width boundary', () => {
    const result = wrapLine('abcdefghij', 5)
    expect(result).toEqual(['abcde', 'fghij'])
  })

  test('handles ANSI codes correctly', () => {
    // "red" with color codes should count as 3 visible chars
    const result = wrapLine('\x1b[31mabcde\x1b[0m', 3)
    expect(result.length).toBe(2)
    // First chunk should have the color code + 3 chars
    expect(result[0]).toContain('\x1b[31m')
  })

  test('preserves ANSI codes across wrapped lines', () => {
    const result = wrapLine('\x1b[31mabcdef\x1b[0m', 3)
    // Each wrapped line should still be red
    expect(result[0]).toContain('\x1b[31m')
    expect(result[1]).toContain('\x1b[31m')
  })
})

describe('splitIntoLines', () => {
  test('splits by newline', () => {
    const result = splitIntoLines('a\nb\nc', 80)
    expect(result).toEqual([
      { content: 'a', isHeader: false },
      { content: 'b', isHeader: false },
      { content: 'c', isHeader: false },
    ])
  })

  test('wraps long lines', () => {
    const result = splitIntoLines('abcdefghij', 5)
    expect(result.length).toBe(2)
    expect(result[0]!.content).toBe('abcde')
    expect(result[1]!.content).toBe('fghij')
  })

  test('detects image placeholders', () => {
    const result = splitIntoLines('text\n\x00IMG:0\x00\nmore', 80)
    expect(result[1]!.imageRef).toBe('\x00IMG:0\x00')
  })

  test('handles empty lines', () => {
    const result = splitIntoLines('a\n\nb', 80)
    expect(result[1]!.content).toBe('')
  })

  test('detects header markers', () => {
    const result = splitIntoLines('\x01Header\nText', 80)
    expect(result[0]!.isHeader).toBe(true)
    expect(result[0]!.content).toBe('Header')
    expect(result[1]!.isHeader).toBe(false)
  })

  test('strips header marker from content', () => {
    const result = splitIntoLines('\x01## Title', 80)
    expect(result[0]!.content).toBe('## Title')
    expect(result[0]!.isHeader).toBe(true)
  })
})
