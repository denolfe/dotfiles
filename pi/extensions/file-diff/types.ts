export type DiffIndicatorMode = 'bars' | 'classic' | 'none'

export type FileDiffConfig = {
  expandedPreviewMaxLines: number
  diffViewMode: 'unified'
  diffIndicatorMode: DiffIndicatorMode
  diffSplitMinWidth: number
  diffCollapsedLines: number
  diffWordWrap: boolean
}

export const FILE_DIFF_CONFIG: FileDiffConfig = {
  expandedPreviewMaxLines: 4000,
  diffViewMode: 'unified',
  diffIndicatorMode: 'bars',
  diffSplitMinWidth: 120,
  diffCollapsedLines: 24,
  diffWordWrap: true,
}
