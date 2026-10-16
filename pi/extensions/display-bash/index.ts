import { createBashToolDefinition, type ExtensionAPI } from '@earendil-works/pi-coding-agent'
import type { BashToolDetails } from '@earendil-works/pi-coding-agent'
import { Text, truncateToWidth, wrapTextWithAnsi, type Component } from '@earendil-works/pi-tui'
import { highlightBashCommand } from './highlight'

type RenderTheme = {
  fg(color: string, text: string): string
  bold(text: string): string
}

/** Collapsed calls show the first lines only; the rest appear when the row is expanded. */
const COLLAPSED_COMMAND_LINES = 3

export default function bashDisplayExtension(pi: ExtensionAPI): void {
  const builtIn = createCwdToolCache(createBashToolDefinition)
  const builtInRenderer = builtIn.get(process.cwd())

  pi.registerTool<ReturnType<typeof createBashToolDefinition>['parameters'], BashToolDetails | undefined>({
    ...builtIn.get(process.cwd()),
    name: 'bash',
    renderShell: 'default',
    async execute(toolCallId, params, signal, onUpdate, context) {
      return builtIn.get(context.cwd).execute(toolCallId, params, signal, onUpdate, context)
    },
    renderCall(args, theme, context) {
      builtInRenderer.renderCall?.(args, theme, { ...context, lastComponent: undefined })
      const command = commandArgument(args)
      const prompt = theme.fg('toolTitle', theme.bold('$'))
      if (!command) return reuseText(context.lastComponent, prompt)

      const body = renderCommand(command, context.expanded === true, theme)
      return new BashCall(prompt, body)
    },
    renderResult(result, options, theme, context) {
      const previous = context.lastComponent
      const child = builtInRenderer.renderResult?.(result, options, theme, {
        ...context,
        lastComponent: previous instanceof IndentedResult ? previous.child : undefined,
      }) ?? new Text('', 0, 0)
      return new IndentedResult(child)
    },
  })
}

class BashCall implements Component {
  constructor(
    private readonly prompt: string,
    private readonly body: string,
  ) {}

  render(width: number): string[] {
    if (width <= 2) return [truncateToWidth(this.prompt, Math.max(0, width), '')]

    const indent = width === 3 ? ' ' : '  '
    const firstPrefix = width === 3 ? this.prompt : `${this.prompt} `
    return wrapTextWithAnsi(this.body, width - indent.length)
      .map((line, index) => `${index === 0 ? firstPrefix : indent}${line}`)
  }

  invalidate(): void {}
}

class IndentedResult implements Component {
  constructor(readonly child: Component) {}

  render(width: number): string[] {
    const indent = ' '.repeat(Math.min(2, Math.max(0, width - 1)))
    return this.child.render(Math.max(1, width - indent.length))
      .map((line) => line.length > 0 ? `${indent}${line}` : line)
  }

  invalidate(): void {
    this.child.invalidate()
  }
}

function renderCommand(command: string, expanded: boolean, theme: RenderTheme): string {
  const lines = command.trim().split('\n')
  if (expanded || lines.length <= COLLAPSED_COMMAND_LINES) {
    return highlightBashCommand(lines.join('\n'), theme)
  }

  const hidden = lines.length - COLLAPSED_COMMAND_LINES
  const visible = highlightBashCommand(lines.slice(0, COLLAPSED_COMMAND_LINES).join('\n'), theme)
  return `${visible}\n${theme.fg('muted', `… ${hidden} more ${hidden === 1 ? 'line' : 'lines'}`)}`
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

function reuseText(lastComponent: Component | undefined, text: string): Component {
  if (lastComponent instanceof Text) {
    lastComponent.setText(text)
    return lastComponent
  }
  return new Text(text, 0, 0)
}

function commandArgument(args: unknown): string {
  if (!args || typeof args !== 'object') return ''
  const value = (args as { command?: unknown }).command
  return typeof value === 'string' ? value : ''
}
