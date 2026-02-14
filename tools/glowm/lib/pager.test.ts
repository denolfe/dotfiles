// lib/pager.test.ts
import { describe, expect, test } from 'bun:test'
import { createPagerState, scroll, renderViewport } from './pager'
import type { Line } from './lines'

const makeLines = (n: number): Line[] =>
  Array.from({ length: n }, (_, i) => ({ content: `Line ${i}`, imageRef: undefined }))

describe('createPagerState', () => {
  test('initializes with correct dimensions', () => {
    const lines = makeLines(100)
    const state = createPagerState(lines, new Map(), 24, 80)

    expect(state.topLine).toBe(0)
    expect(state.lines.length).toBe(100)
    expect(state.termHeight).toBe(24)
    expect(state.termWidth).toBe(80)
  })
})

describe('scroll', () => {
  test('scrolls down by delta', () => {
    const lines = makeLines(100)
    const state = createPagerState(lines, new Map(), 24, 80)

    scroll(state, 5)
    expect(state.topLine).toBe(5)
  })

  test('scrolls up by negative delta', () => {
    const lines = makeLines(100)
    const state = createPagerState(lines, new Map(), 24, 80)
    state.topLine = 10

    scroll(state, -3)
    expect(state.topLine).toBe(7)
  })

  test('clamps at top', () => {
    const lines = makeLines(100)
    const state = createPagerState(lines, new Map(), 24, 80)
    state.topLine = 5

    scroll(state, -10)
    expect(state.topLine).toBe(0)
  })

  test('clamps at bottom', () => {
    const lines = makeLines(100)
    const state = createPagerState(lines, new Map(), 24, 80)

    scroll(state, 200)
    // Should stop so last line is visible
    expect(state.topLine).toBe(100 - 23) // lines - (height - 1 for prompt)
  })
})

describe('renderViewport', () => {
  test('renders visible lines only', () => {
    const lines = makeLines(100)
    const state = createPagerState(lines, new Map(), 5, 80)
    state.topLine = 10

    const output = renderViewport(state)
    expect(output).toContain('Line 10')
    expect(output).toContain('Line 13') // 4 lines visible (5 - 1 for prompt)
    expect(output).not.toContain('Line 9')
    expect(output).not.toContain('Line 14')
  })

  test('shows : prompt at bottom', () => {
    const lines = makeLines(100)
    const state = createPagerState(lines, new Map(), 5, 80)

    const output = renderViewport(state)
    expect(output).toContain(':')
  })

  test('shows (END) when at bottom', () => {
    const lines = makeLines(10)
    const state = createPagerState(lines, new Map(), 20, 80)
    state.topLine = 0 // All lines fit

    const output = renderViewport(state)
    expect(output).toContain('(END)')
  })
})
