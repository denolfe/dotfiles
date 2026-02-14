import type { ChalkInstance } from 'chalk'
import chalk from 'chalk'
import type { markedTerminal } from 'marked-terminal'

type MarkedTerminalOptions = Parameters<typeof markedTerminal>[0]

type Theme = {
  foreground: string
  foregroundBright: string
  foregroundMuted: string
  foregroundDim: string
  background: string
  red: string
  green: string
  yellow: string
  blue: string
  magenta: string
  cyan: string
}

type RendererColors = {
  blockquotePipe: ChalkInstance
  blockquoteText: ChalkInstance
  caption: ChalkInstance
  dim: ChalkInstance
  h1: ChalkInstance
  imageLabel: ChalkInstance
  imagePath: ChalkInstance
}

/** VS Code Dark+ terminal theme */
const theme: Theme = {
  foreground: '#d4d4d4',
  foregroundBright: '#e5e5e5',
  foregroundMuted: '#9d9d9d',
  foregroundDim: '#666666',
  background: '#1e1e1e',
  red: '#f14c4c',
  green: '#23d18b',
  yellow: '#f5f543',
  blue: '#2472c8',
  magenta: '#bc3fbc',
  cyan: '#11a8cd',
}

/** Colors for markedTerminal options */
export const terminalColors: MarkedTerminalOptions = {
  firstHeading: chalk.hex('#000000').bold.bgHex(theme.cyan),
  heading: chalk.hex(theme.cyan).bold,
  codespan: chalk.hex(theme.red).bgHex(theme.background),
  code: chalk.hex(theme.foreground),
  blockquote: chalk.hex(theme.foregroundDim).italic,
  link: chalk.hex(theme.blue),
  href: chalk.hex(theme.blue).underline,
  strong: chalk.bold,
  em: chalk.italic,
  del: chalk.hex(theme.foregroundMuted).strikethrough,
}

/** Colors for custom renderer enhancements */
export const colors: RendererColors = {
  blockquotePipe: chalk.hex(theme.foreground),
  blockquoteText: chalk.hex(theme.foregroundMuted).italic,
  caption: chalk.dim.italic,
  dim: chalk.dim,
  h1: chalk.hex('#000000').bold.bgHex(theme.blue),
  imageLabel: chalk.hex(theme.foregroundMuted),
  imagePath: chalk.hex(theme.foregroundMuted).underline,
}
