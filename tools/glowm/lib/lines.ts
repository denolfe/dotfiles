import { visibleLength } from './ansi'

export type Line = {
  content: string
  imageRef?: string
}

const IMAGE_PLACEHOLDER_REGEX = /^\x00IMG:\d+\x00$/

/**
 * Wrap a single line to fit within width, preserving ANSI codes.
 * Returns array of wrapped line segments.
 */
export function wrapLine(line: string, width: number): string[] {
  const visLen = visibleLength(line)
  if (visLen <= width) return [line]

  const result: string[] = []
  let remaining = line
  let activeAnsi = '' // Track active ANSI codes to reapply

  while (visibleLength(remaining) > width) {
    let chunk = ''
    let visibleCount = 0
    let i = 0

    while (i < remaining.length && visibleCount < width) {
      const match = remaining.slice(i).match(/^\x1b\[[0-9;]*m/)
      if (match) {
        activeAnsi = match[0] // Track last ANSI code
        chunk += match[0]
        i += match[0].length
      } else {
        chunk += remaining[i]
        visibleCount++
        i++
      }
    }

    result.push(chunk)
    remaining = activeAnsi + remaining.slice(i) // Reapply active ANSI
  }

  if (remaining) result.push(remaining)
  return result
}

/**
 * Split rendered content into Line objects for pager display.
 * Handles newlines, word wrapping, and image placeholder detection.
 */
export function splitIntoLines(content: string, width: number): Line[] {
  const rawLines = content.split('\n')
  const result: Line[] = []

  for (const raw of rawLines) {
    // Check for image placeholder
    if (IMAGE_PLACEHOLDER_REGEX.test(raw.trim())) {
      result.push({ content: raw, imageRef: raw.trim() })
      continue
    }

    // Wrap long lines
    const wrapped = wrapLine(raw, width)
    for (const segment of wrapped) {
      result.push({ content: segment, imageRef: undefined })
    }
  }

  return result
}
