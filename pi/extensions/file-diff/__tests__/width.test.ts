import { describe, expect, test } from 'bun:test'
import { truncateToWidth, visibleWidth } from '@earendil-works/pi-tui'
import { buildDiffSummaryText, resolveDiffPresentationMode } from '../diff-presentation'
import {
  buildCollapsedDiffHintText,
  clampRenderedLineToWidth,
} from '../line-width-safety'

const widthOps = {
  measure: visibleWidth,
  truncate: (text: string, width: number) => truncateToWidth(text, width, ''),
}

describe('edit diff width handling', () => {
  test('selects responsive unified fallbacks', () => {
    expect(resolveDiffPresentationMode(80)).toBe('unified')
    expect(resolveDiffPresentationMode(17)).toBe('compact')
    expect(resolveDiffPresentationMode(7)).toBe('summary')
  })

  test('fits summaries at every positive width', () => {
    for (const width of [1, 4, 7, 12, 24]) {
      const summary = buildDiffSummaryText(
        { added: 12, removed: 3, hunks: 2, files: 1 },
        width,
      )
      expect(visibleWidth(summary)).toBeLessThanOrEqual(width)
    }
  })

  test('shortens collapsed hints for narrow panes', () => {
    for (const width of [1, 8, 16, 40]) {
      const hint = buildCollapsedDiffHintText(
        { remainingLines: 30, hiddenHunks: 3 },
        width,
        widthOps,
      )
      expect(visibleWidth(hint)).toBeLessThanOrEqual(width)
    }
  })

  test('clamps ANSI-styled and wide-character text', () => {
    const value = '\x1b[31mchanged 漢字 content\x1b[0m'
    const clamped = clampRenderedLineToWidth(value, 12, widthOps)
    expect(visibleWidth(clamped)).toBeLessThanOrEqual(12)
  })
})
