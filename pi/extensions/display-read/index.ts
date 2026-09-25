import { createReadTool, type ExtensionAPI } from '@earendil-works/pi-coding-agent'
import { Text, truncateToWidth, visibleWidth, wrapTextWithAnsi, type Component } from '@earendil-works/pi-tui'

type RenderTheme = {
  fg(color: string, text: string): string
  bold(text: string): string
}

const PREVIEW_LINE_COUNT = 5
const RESULT_INDENT = '  '

export default function readDisplayExtension(pi: ExtensionAPI): void {
  const builtIn = createCwdToolCache(createReadTool)

  pi.registerTool({
    ...builtIn.get(process.cwd()),
    name: 'read',
    renderShell: 'default',
    async execute(toolCallId, params, signal, onUpdate, context) {
      return builtIn.get(context.cwd).execute(toolCallId, params, signal, onUpdate)
    },
    renderCall(args, theme, context) {
      const title = `${theme.fg('toolTitle', theme.bold('Read'))} ${theme.fg('accent', pathArgument(args))}${theme.fg('warning', rangeSuffix(args))}`
      return reuseText(context.lastComponent, title)
    },
    renderResult(result, options, theme, context) {
      if (options.isPartial) {
        return new Text(theme.fg('muted', 'reading…'), 0, 0)
      }

      const fallback = textContent(result)
      if (context.isError) {
        return new Text(theme.fg('error', fallback || 'Read failed.'), 0, 0)
      }

      const preview = createContentPreview(fallback, context.args, theme)
      return preview ?? new Text(theme.fg('muted', '└ read completed (no text output)'), 0, 0)
    },
  })
}

/** Built-in tools are bound to a working directory, so one is kept per observed cwd. */
function createCwdToolCache<TTool>(create: (cwd: string) => TTool): { get(cwd: string): TTool } {
  let cachedCwd: string | undefined
  let cachedTool: TTool | undefined

  return {
    get(cwd: string): TTool {
      if (!cachedTool || cachedCwd !== cwd) {
        cachedCwd = cwd
        cachedTool = create(cwd)
      }
      return cachedTool
    },
  }
}

function createContentPreview(content: string, args: unknown, theme: RenderTheme): Component | undefined {
  const offset = lineNumberArgument(args, 'offset') ?? 1
  const lines = content.split('\n')
    .filter((line) => !/^\[\d+ more lines? in file\./.test(line.trim()))
    .slice(0, PREVIEW_LINE_COUNT)

  if (lines.length === 0) return undefined

  return new ReadPreview(lines, offset, theme)
}

class ReadPreview implements Component {
  constructor(
    private readonly lines: string[],
    private readonly offset: number,
    private readonly theme: RenderTheme,
  ) {}

  render(width: number): string[] {
    const lineNumberWidth = String(this.offset + Math.max(0, this.lines.length - 1)).length
    return this.lines.flatMap((line, index) => this.renderSourceLine(line, index, lineNumberWidth, width))
  }

  private renderSourceLine(line: string, index: number, lineNumberWidth: number, width: number): string[] {
    const lineNumber = this.offset + index
    const firstPrefix = this.theme.fg('muted', `${RESULT_INDENT}${String(lineNumber).padStart(lineNumberWidth, ' ')} │ `)
    const continuationPrefix = this.theme.fg('muted', `${RESULT_INDENT}${' '.repeat(lineNumberWidth)} │ `)
    const contentWidth = Math.max(1, width - visibleWidth(firstPrefix))
    const styledContent = this.theme.fg('toolOutput', line)
    const wrapped = line.length === 0 ? [''] : wrapTextWithAnsi(styledContent, contentWidth)

    return wrapped.map((segment, segmentIndex) => {
      const prefix = segmentIndex === 0 ? firstPrefix : continuationPrefix
      return fitLine(`${prefix}${segment}`, width)
    })
  }

  invalidate(): void {}
}

function fitLine(line: string, width: number): string {
  const clamped = truncateToWidth(line, Math.max(0, width), '')
  const padding = Math.max(0, width - visibleWidth(clamped))
  return `${clamped}${' '.repeat(padding)}`
}

function reuseText(lastComponent: Component | undefined, text: string): Component {
  if (lastComponent instanceof Text) {
    lastComponent.setText(text)
    return lastComponent
  }
  return new Text(text, 0, 0)
}

function pathArgument(args: unknown): string {
  if (!args || typeof args !== 'object') return '…'
  const value = (args as { path?: unknown }).path
  return typeof value === 'string' && value.length > 0 ? value : '…'
}

function textContent(result: { content?: Array<{ type: string; text?: string }> }): string {
  return (result.content ?? [])
    .filter((item) => item.type === 'text')
    .map((item) => item.text ?? '')
    .join('\n')
    .trimEnd()
}

function rangeSuffix(args: unknown): string {
  const offset = lineNumberArgument(args, 'offset') ?? 1
  const limit = lineNumberArgument(args, 'limit')
  if (limit === undefined) return `:${offset}`
  return `:${offset}-${Math.max(offset, offset + limit - 1)}`
}

function lineNumberArgument(args: unknown, key: 'offset' | 'limit'): number | undefined {
  if (!args || typeof args !== 'object') return undefined
  const value = (args as { offset?: unknown; limit?: unknown })[key]
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.max(0, Math.floor(value))
}
