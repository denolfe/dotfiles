// lib/keys.test.ts
import { describe, expect, test } from 'bun:test'
import { parseKey, KEY } from './keys'

describe('parseKey', () => {
  test('recognizes j as down', () => {
    expect(parseKey('j')).toBe(KEY.DOWN)
  })

  test('recognizes k as up', () => {
    expect(parseKey('k')).toBe(KEY.UP)
  })

  test('recognizes space as page down', () => {
    expect(parseKey(' ')).toBe(KEY.PAGE_DOWN)
  })

  test('recognizes b as page up', () => {
    expect(parseKey('b')).toBe(KEY.PAGE_UP)
  })

  test('recognizes q as quit', () => {
    expect(parseKey('q')).toBe(KEY.QUIT)
  })

  test('recognizes g as top', () => {
    expect(parseKey('g')).toBe(KEY.TOP)
  })

  test('recognizes G as bottom', () => {
    expect(parseKey('G')).toBe(KEY.BOTTOM)
  })

  test('recognizes / as search', () => {
    expect(parseKey('/')).toBe(KEY.SEARCH)
  })

  test('recognizes n as next match', () => {
    expect(parseKey('n')).toBe(KEY.NEXT_MATCH)
  })

  test('recognizes N as prev match', () => {
    expect(parseKey('N')).toBe(KEY.PREV_MATCH)
  })

  test('recognizes = as info', () => {
    expect(parseKey('=')).toBe(KEY.INFO)
  })

  test('recognizes down arrow', () => {
    expect(parseKey('\x1b[B')).toBe(KEY.DOWN)
  })

  test('recognizes up arrow', () => {
    expect(parseKey('\x1b[A')).toBe(KEY.UP)
  })

  test('recognizes Ctrl+F as page down', () => {
    expect(parseKey('\x06')).toBe(KEY.PAGE_DOWN)
  })

  test('recognizes Ctrl+B as page up', () => {
    expect(parseKey('\x02')).toBe(KEY.PAGE_UP)
  })

  test('recognizes Ctrl+D as half page down', () => {
    expect(parseKey('\x04')).toBe(KEY.HALF_DOWN)
  })

  test('recognizes Ctrl+U as half page up', () => {
    expect(parseKey('\x15')).toBe(KEY.HALF_UP)
  })

  test('returns unknown for unrecognized keys', () => {
    expect(parseKey('x')).toBe(KEY.UNKNOWN)
  })
})
