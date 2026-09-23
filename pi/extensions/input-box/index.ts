import { CustomEditor, type ExtensionAPI, type KeybindingsManager, type Theme } from '@earendil-works/pi-coding-agent'
import {
  truncateToWidth,
  visibleWidth,
  type EditorTheme,
  type TUI,
} from '@earendil-works/pi-tui'

const HORIZONTAL_PADDING = 0
const VERTICAL_PADDING = 1
const CARET = '› '
const FALLBACK_USER_MESSAGE_BG_ANSI = '\x1b[48;2;45;45;48m'
const ANSI_BG_RESET = '\x1b[49m'

export default function inputBoxExtension(pi: ExtensionAPI): void {
  pi.on('session_start', (_event, ctx) => {
    const appTheme = ctx.ui.theme
    ctx.ui.setEditorComponent((tui, editorTheme, keybindings) => (
      new PaddedCaretEditor(tui, editorTheme, keybindings, appTheme)
    ))
  })
}

class PaddedCaretEditor extends CustomEditor {
  constructor(
    tui: TUI,
    editorTheme: EditorTheme,
    keybindings: KeybindingsManager,
    private readonly appTheme: Theme,
  ) {
    super(tui, editorTheme, keybindings, { paddingX: 0 })
  }

  render(width: number): string[] {
    const innerWidth = Math.max(1, width - HORIZONTAL_PADDING * 2)
    const editorWidth = Math.max(1, innerWidth - visibleWidth(CARET))
    const defaultLines = super.render(editorWidth)
    const { editorLines, trailingLines } = splitDefaultEditorLines(defaultLines)
    const contentLines = editorLines.slice(1, -1)

    const rendered = [
      ...Array.from({ length: VERTICAL_PADDING }, () => this.backgroundLine('', width)),
      ...contentLines.map((line, index) => this.renderInputLine(line, index, innerWidth, width)),
      ...Array.from({ length: VERTICAL_PADDING }, () => this.backgroundLine('', width)),
    ]

    return [...rendered, ...trailingLines]
  }

  private renderInputLine(line: string, index: number, innerWidth: number, width: number): string {
    const prefix = index === 0 ? this.appTheme.fg('userMessageText', CARET) : ' '.repeat(visibleWidth(CARET))
    const content = `${prefix}${line.trimEnd()}`
    return this.backgroundLine(content, width, innerWidth)
  }

  private backgroundLine(content: string, width: number, innerWidth = Math.max(1, width - HORIZONTAL_PADDING * 2)): string {
    const clamped = truncateToWidth(content, innerWidth, '')
    const paddedContent = `${clamped}${' '.repeat(Math.max(0, innerWidth - visibleWidth(clamped)))}`
    const line = `${' '.repeat(HORIZONTAL_PADDING)}${paddedContent}${' '.repeat(HORIZONTAL_PADDING)}`
    const bgAnsi = this.appTheme.getBgAnsi?.('userMessageBg') ?? FALLBACK_USER_MESSAGE_BG_ANSI
    return `${bgAnsi}${keepBackgroundAcrossResets(line, bgAnsi)}${ANSI_BG_RESET}`
  }
}

function splitDefaultEditorLines(lines: string[]): { editorLines: string[]; trailingLines: string[] } {
  if (lines.length <= 2) return { editorLines: lines, trailingLines: [] }

  const trailingStart = lines.findIndex((line, index) => index > 0 && isHorizontalBorderLine(line))
  if (trailingStart === -1) return { editorLines: lines, trailingLines: [] }

  return {
    editorLines: lines.slice(0, trailingStart + 1),
    trailingLines: lines.slice(trailingStart + 1),
  }
}

function isHorizontalBorderLine(line: string): boolean {
  const stripped = stripAnsi(line).trim()
  return stripped.length > 0 && /^[─↑↓0-9\s]+$/.test(stripped)
}

function keepBackgroundAcrossResets(text: string, bgAnsi: string): string {
  return text.replace(/\x1b\[([0-9;]*)m/g, (sequence, rawParams: string) => {
    const params = rawParams === '' ? [0] : rawParams.split(';').map((param) => Number(param || 0))
    return params.some((param) => param === 0 || param === 49) ? `${sequence}${bgAnsi}` : sequence
  })
}

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '')
}
