import {
  createEditTool,
  createWriteTool,
  formatSize,
  type ExtensionAPI,
} from '@earendil-works/pi-coding-agent'
import { Text, truncateToWidth, visibleWidth, type Component } from '@earendil-works/pi-tui'
import { pluralize } from './formatting'
import { renderCompletedDiff } from './renderer'
import {
  buildWriteUnifiedDiff,
  countWriteContentLines,
  getWriteContentSizeBytes,
  resolveWriteDiffGuard,
  splitWriteContentLines,
} from './write-diff'
import { readWorkspaceUtf8File } from './workspace-file'
import type { WorkspaceFileRead } from './workspace-file'

type RenderTheme = {
  fg(color: string, text: string): string
  bg?: (color: string, text: string) => string
  bold(text: string): string
}

const FALLBACK_CONTAINER_BG_ANSI = '\x1b[48;2;38;38;39m'
const ANSI_BG_RESET = '\x1b[49m'
const TOOL_PADDING_X = 1

export default function fileDiffExtension(pi: ExtensionAPI): void {
  registerEditTool(pi)
  registerWriteTool(pi)
}

function registerEditTool(pi: ExtensionAPI): void {
  const builtIn = createCwdToolCache(createEditTool)

  pi.registerTool({
    ...builtIn.get(process.cwd()),
    name: 'edit',
    renderShell: 'self',
    async execute(toolCallId, params, signal, onUpdate, context) {
      return builtIn.get(context.cwd).execute(toolCallId, params, signal, onUpdate)
    },
    renderCall(args, theme, context) {
      return reuseThemeBox(context.lastComponent, callSummary('Edit', pathArgument(args), theme), theme)
    },
    renderResult(result, options, theme, context) {
      if (options.isPartial) {
        return new Text(theme.fg('muted', 'editing…'), 0, 0)
      }

      const fallback = textContent(result)
      if (context.isError) {
        return new Text(theme.fg('error', fallback || 'Edit failed.'), 0, 0)
      }

      const details = result.details as { diff?: unknown } | undefined
      if (typeof details?.diff !== 'string' || details.diff.trim().length === 0) {
        return resultFallback(fallback, 'edit completed (no diff payload)', theme)
      }

      return renderCompletedDiff(
        details,
        { expanded: options.expanded, filePath: pathArgument(context.args) },
        theme,
      )
    },
  })
}

function registerWriteTool(pi: ExtensionAPI): void {
  const builtIn = createCwdToolCache(createWriteTool)
  /** Pre-write content is only readable before execution, so it is carried to the result render. */
  const previousFileByToolCallId = new Map<string, WorkspaceFileRead>()

  pi.registerTool({
    ...builtIn.get(process.cwd()),
    name: 'write',
    renderShell: 'self',
    async execute(toolCallId, params, signal, onUpdate, context) {
      previousFileByToolCallId.set(
        toolCallId,
        readWorkspaceUtf8File({ cwd: context.cwd, path: (params as { path?: unknown }).path }),
      )
      return builtIn.get(context.cwd).execute(toolCallId, params, signal, onUpdate)
    },
    renderCall(args, theme, context) {
      const content = contentArgument(args)
      const suffix = content === undefined
        ? ''
        : theme.fg(
          'muted',
          ` (${countWriteContentLines(content)} ${pluralize(countWriteContentLines(content), 'line')} • ${formatSize(getWriteContentSizeBytes(content))})`,
        )
      return reuseThemeBox(context.lastComponent, `${callSummary('Write', pathArgument(args), theme)}${suffix}`, theme)
    },
    renderResult(result, options, theme, context) {
      if (options.isPartial) {
        return new Text(theme.fg('muted', 'writing…'), 0, 0)
      }

      const fallback = textContent(result)
      if (context.isError) {
        previousFileByToolCallId.delete(context.toolCallId)
        return new Text(theme.fg('error', fallback || 'Write failed.'), 0, 0)
      }

      const content = contentArgument(context.args)
      if (content === undefined) {
        return resultFallback(fallback, 'write completed', theme)
      }

      const previousFile = takeWorkspaceFileRead(previousFileByToolCallId, context)
      const hasComparablePrevious = previousFile.exists && typeof previousFile.content === 'string'
      const nextLines = splitWriteContentLines(content)
      const previousLines = hasComparablePrevious ? splitWriteContentLines(previousFile.content ?? '') : []
      const label = previousFile.exists ? 'overwritten' : 'created'

      if (nextLines.length === 0 && previousLines.length === 0) {
        return new Text(theme.fg('muted', `└ ${label} (empty file)`), 0, 0)
      }

      const guard = resolveWriteDiffGuard({ previousLines, nextLines })
      if (guard) {
        return new Text(
          theme.fg(
            'warning',
            `└ ${label} • diff omitted (${guard.previousLineCount} → ${guard.nextLineCount} lines)`,
          ),
          0,
          0,
        )
      }

      return renderCompletedDiff(
        { diff: buildWriteUnifiedDiff({ previousLines, nextLines }) },
        {
          expanded: options.expanded,
          filePath: pathArgument(context.args),
          headerLabel: label,
          hideHunkHeaders: true,
        },
        theme,
      )
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

/** Moves the captured pre-write file into the per-row render state so the map stays small. */
function takeWorkspaceFileRead(
  previousFileByToolCallId: Map<string, WorkspaceFileRead>,
  context: { toolCallId: string; state: Record<string, unknown> },
): WorkspaceFileRead {
  const stored = context.state?.previousFile as WorkspaceFileRead | undefined
  if (stored) return stored

  const captured = previousFileByToolCallId.get(context.toolCallId) ?? { exists: false }
  previousFileByToolCallId.delete(context.toolCallId)
  if (context.state) context.state.previousFile = captured
  return captured
}

function callSummary(label: string, path: string, theme: RenderTheme): string {
  return `${theme.fg('toolTitle', theme.bold(label))} ${theme.fg('accent', path)}`
}

function resultFallback(fallback: string, emptyMessage: string, theme: RenderTheme): Component {
  return new Text(
    fallback ? theme.fg('toolOutput', fallback) : theme.fg('muted', `└ ${emptyMessage}`),
    0,
    0,
  )
}

function reuseThemeBox(lastComponent: Component | undefined, text: string, theme: RenderTheme): Component {
  const existingText = isThemeCallBox(lastComponent) ? lastComponent.text : undefined

  if (existingText) {
    existingText.setText(text)
    return lastComponent
  }

  return createThemeCallBox(new Text(text, 0, 0), theme)
}

function createThemeCallBox(text: Text, theme: RenderTheme): Component & { text: Text; kind: 'theme-call-box' } {
  return {
    kind: 'theme-call-box',
    text,
    render(width: number): string[] {
      const contentWidth = Math.max(0, width - TOOL_PADDING_X)
      return [
        themeBackgroundLine('', width, theme),
        ...text.render(contentWidth).map((line) => themeBackgroundLine(line, width, theme)),
      ]
    },
    invalidate: () => text.invalidate?.(),
  }
}

function isThemeCallBox(component: Component | undefined): component is Component & { text: Text; kind: 'theme-call-box' } {
  return !!component && (component as { kind?: unknown }).kind === 'theme-call-box' && (component as { text?: unknown }).text instanceof Text
}

function themeBackgroundLine(line: string, width: number, theme: RenderTheme): string {
  const paddedLine = `${' '.repeat(TOOL_PADDING_X)}${line}`
  const clampedLine = truncateToWidth(paddedLine, Math.max(0, width), '')
  const padded = `${clampedLine}${' '.repeat(Math.max(0, width - visibleWidth(clampedLine)))}`
  return theme.bg?.('toolSuccessBg', padded) ?? `${FALLBACK_CONTAINER_BG_ANSI}${padded}${ANSI_BG_RESET}`
}

function textContent(result: { content?: Array<{ type: string; text?: string }> }): string {
  return (result.content ?? [])
    .filter((item) => item.type === 'text')
    .map((item) => item.text ?? '')
    .join('\n')
    .trim()
}

function pathArgument(args: unknown): string {
  if (!args || typeof args !== 'object') return '…'
  const value = (args as { path?: unknown; file_path?: unknown }).path
    ?? (args as { file_path?: unknown }).file_path
  return typeof value === 'string' && value.length > 0 ? value : '…'
}

function contentArgument(args: unknown): string | undefined {
  if (!args || typeof args !== 'object') return undefined
  const value = (args as { content?: unknown }).content
  return typeof value === 'string' ? value : undefined
}
