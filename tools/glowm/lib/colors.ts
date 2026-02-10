import chalk from 'chalk'

/** VS Code Dark+ terminal theme */
const theme = {
  foreground: '#cccccc',
  foregroundBright: '#e5e5e5',
  background: '#303031',
  red: '#f14c4c',
  green: '#23d18b',
  blue: '#3b8eea',
  magenta: '#bc3fbc',
  cyan: '#0dbc79',
}

/** Colors for markedTerminal options */
export const terminalColors = {
  firstHeading: chalk.hex(theme.foregroundBright).bold.bgHex(theme.magenta),
  heading: chalk.hex(theme.green).bold,
  codespan: chalk.hex(theme.red).bgHex(theme.background),
  code: chalk.hex(theme.foreground),
  blockquote: chalk.hex(theme.cyan).italic,
  link: chalk.hex(theme.blue),
  href: chalk.hex(theme.blue).underline,
  strong: chalk.bold,
  em: chalk.italic,
}

/** Colors for custom renderer enhancements */
export const colors = {
  blockquotePipe: chalk.hex(theme.cyan),
  dim: chalk.dim,
}
