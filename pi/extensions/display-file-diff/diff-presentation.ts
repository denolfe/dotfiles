import { truncateToWidth, visibleWidth } from '@earendil-works/pi-tui'
import { pluralize } from './formatting'

export interface DiffSummaryStats {
  added: number
  removed: number
  hunks: number
  files: number
}

export type DiffPresentationMode = 'unified' | 'compact' | 'summary'

const MIN_COMPACT_DIFF_WIDTH = 8
const MIN_UNIFIED_DIFF_WIDTH = 18

export function normalizeDiffRenderWidth(width: number): number {
  if (!Number.isFinite(width)) return 0
  return Math.max(0, Math.floor(width))
}

export function resolveDiffPresentationMode(width: number): DiffPresentationMode {
  const safeWidth = normalizeDiffRenderWidth(width)
  if (safeWidth < MIN_COMPACT_DIFF_WIDTH) return 'summary'
  if (safeWidth < MIN_UNIFIED_DIFF_WIDTH) return 'compact'
  return 'unified'
}

export function buildDiffSummaryText(stats: DiffSummaryStats, width: number, label = 'diff'): string {
  const safeWidth = normalizeDiffRenderWidth(width)
  if (safeWidth === 0) return ''

  const summaryCandidates = [
    `└ ${label} +${stats.added} -${stats.removed} • ${stats.files} ${pluralize(stats.files, 'file')} • ${stats.hunks} ${pluralize(stats.hunks, 'hunk')}`,
    `└ ${label} +${stats.added} -${stats.removed} • ${stats.files}f • ${stats.hunks}h`,
    `└ ${label} +${stats.added} -${stats.removed}`,
    `+${stats.added} -${stats.removed}`,
    label,
    '…',
  ]

  for (const candidate of summaryCandidates) {
    if (visibleWidth(candidate) <= safeWidth) return candidate
  }

  return truncateToWidth(summaryCandidates.at(-1) ?? '', safeWidth, '')
}
