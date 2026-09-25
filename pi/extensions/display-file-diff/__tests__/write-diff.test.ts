import { describe, expect, test } from 'bun:test'
import {
  buildWriteUnifiedDiff,
  countWriteContentLines,
  getWriteContentSizeBytes,
  resolveWriteDiffGuard,
  splitWriteContentLines,
} from '../write-diff'

describe('write content measurement', () => {
  test('ignores the trailing newline when counting lines', () => {
    expect(splitWriteContentLines('a\nb\n')).toEqual(['a', 'b'])
    expect(splitWriteContentLines('a\nb')).toEqual(['a', 'b'])
    expect(splitWriteContentLines('a\r\nb\r\n')).toEqual(['a', 'b'])
    expect(splitWriteContentLines('')).toEqual([])
  })

  test('reports line counts and byte sizes only for string content', () => {
    expect(countWriteContentLines('a\nb\n')).toBe(2)
    expect(countWriteContentLines(undefined)).toBe(0)
    expect(getWriteContentSizeBytes('héllo')).toBe(6)
    expect(getWriteContentSizeBytes(42)).toBe(0)
  })
})

describe('write unified diff synthesis', () => {
  test('renders a created file as a single all-addition hunk', () => {
    const diff = buildWriteUnifiedDiff({ previousLines: [], nextLines: ['alpha', 'bravo'] })

    expect(diff).toBe(['@@ -0,0 +1,2 @@', '+alpha', '+bravo'].join('\n'))
  })

  test('keeps unchanged lines as context when overwriting', () => {
    const diff = buildWriteUnifiedDiff({
      previousLines: ['alpha', 'bravo', 'charlie'],
      nextLines: ['alpha', 'delta', 'charlie'],
    })

    expect(diff.split('\n')).toEqual([
      '@@ -1,3 +1,3 @@',
      ' alpha',
      '-bravo',
      '+delta',
      ' charlie',
    ])
  })

  test('marks every previous line removed when the new content is empty', () => {
    const diff = buildWriteUnifiedDiff({ previousLines: ['alpha'], nextLines: [] })

    expect(diff.split('\n')).toEqual(['@@ -1,1 +0,0 @@', '-alpha'])
  })

  test('returns an empty diff when there is nothing to show', () => {
    expect(buildWriteUnifiedDiff({ previousLines: [], nextLines: [] })).toBe('')
  })
})

describe('write diff guard', () => {
  test('allows diffs within the line and matrix limits', () => {
    expect(resolveWriteDiffGuard({ previousLines: lines(500), nextLines: lines(500) })).toBeUndefined()
    expect(resolveWriteDiffGuard({ previousLines: [], nextLines: lines(4000) })).toBeUndefined()
  })

  test('blocks diffs beyond the line limit', () => {
    expect(resolveWriteDiffGuard({ previousLines: lines(4001), nextLines: lines(1) })).toEqual({
      previousLineCount: 4001,
      nextLineCount: 1,
    })
  })

  test('blocks diffs whose comparison matrix is too large', () => {
    expect(resolveWriteDiffGuard({ previousLines: lines(2000), nextLines: lines(2000) })).toEqual({
      previousLineCount: 2000,
      nextLineCount: 2000,
    })
  })
})

function lines(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `line ${index + 1}`)
}
