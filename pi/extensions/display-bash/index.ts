import { createBashTool, type ExtensionAPI } from '@earendil-works/pi-coding-agent'
import { Text, type Component } from '@earendil-works/pi-tui'
import { highlightBashCommand } from './highlight'

type RenderTheme = {
  fg(color: string, text: string): string
  bold(text: string): string
}

/** Collapsed calls show the first lines only; the rest appear when the row is expanded. */
const COLLAPSED_COMMAND_LINES = 3

export default function bashDisplayExtension(pi: ExtensionAPI): void {
  const builtIn = createCwdToolCache(createBashTool)

  pi.registerTool({
    ...builtIn.get(process.cwd()),
    name: 'bash',
    renderShell: 'default',
    async execute(toolCallId, params, signal, onUpdate, context) {
      return builtIn.get(context.cwd).execute(toolCallId, params, signal, onUpdate)
    },
    renderCall(args, theme, context) {
      const command = commandArgument(args)
      const title = theme.fg('toolTitle', theme.bold('Bash'))
      if (!command) return reuseText(context.lastComponent, title)

      const body = renderCommand(command, context.expanded === true, theme)
      return reuseText(
        context.lastComponent,
        `${title}${theme.fg('toolTitle', '(')}${body}${theme.fg('toolTitle', ')')}`,
      )
    },
  })
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
