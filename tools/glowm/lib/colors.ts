import chalk from 'chalk'

/** VS Code Dark+ terminal theme */
const theme = {
  foreground: '#cccccc',
  foregroundBright: '#e5e5e5',
  foregroundDim: '#6e6e6e',
  background: '#303031',
  red: '#f14c4c',
  green: '#23d18b',
  blue: '#2372C8',
  magenta: '#bc3fbc',
  cyan: '#13A7CD',
}

/** Colors for markedTerminal options */
export const terminalColors = {
  firstHeading: chalk.hex('#000000').bold.bgHex(theme.blue),
  heading: chalk.hex(theme.blue).bold,
  codespan: chalk.hex(theme.red).bgHex(theme.background),
  code: chalk.hex(theme.foreground),
  blockquote: chalk.hex(theme.foregroundDim).italic,
  link: chalk.hex(theme.blue),
  href: chalk.hex(theme.blue).underline,
  strong: chalk.bold,
  em: chalk.italic,
}

/** Colors for custom renderer enhancements */
export const colors = {
  blockquotePipe: chalk.hex(theme.foreground),
  blockquoteText: chalk.hex(theme.foregroundDim).italic,
  dim: chalk.dim,
  h1: chalk.hex('#000000').bold.bgHex(theme.blue),
}
