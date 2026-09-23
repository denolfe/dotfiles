export type BashTokenKind =
  | 'command'
  | 'flag'
  | 'string'
  | 'variable'
  | 'number'
  | 'operator'
  | 'comment'
  | 'path'
  | 'text'
  | 'whitespace'

export type BashToken = {
  kind: BashTokenKind
  text: string
}

type HighlightTheme = {
  fg(color: string, text: string): string
}

const TOKEN_COLORS: Record<BashTokenKind, string | undefined> = {
  command: 'syntaxFunction',
  flag: 'syntaxKeyword',
  string: 'syntaxString',
  variable: 'syntaxVariable',
  number: 'syntaxNumber',
  operator: 'syntaxOperator',
  comment: 'syntaxComment',
  path: 'accent',
  text: 'text',
  whitespace: undefined,
}

/** Words that wrap another command, so the next word is still a command head. */
const COMMAND_PREFIXES = new Set(['sudo', 'doas', 'env', 'time', 'nohup', 'xargs', 'command', 'exec', 'nice', 'then', 'do', 'else'])

/** Operators after which the next word starts a new command. */
const COMMAND_SEPARATORS = new Set(['|', '||', '&&', ';', '&', '(', ')', '{', '}', '$(', '`', '!'])

/** Operators after which the next word names a file. */
const REDIRECTIONS = new Set(['>', '>>', '<', '<<', '<<<', '2>', '2>>', '&>'])

const OPERATOR_CHARS = new Set(['|', '&', ';', '>', '<', '(', ')', '{', '}', '`'])

export function highlightBashCommand(command: string, theme: HighlightTheme): string {
  return tokenizeBashCommand(command)
    .map((token) => {
      const color = TOKEN_COLORS[token.kind]
      return color ? theme.fg(color, token.text) : token.text
    })
    .join('')
}

/**
 * Splits a shell command into display tokens.
 *
 * Classification is positional rather than keyword-based: the first word of each
 * command is the command head, words after a redirection are paths, and anything
 * starting with `-` is a flag. That is what a keyword-list highlighter misses.
 */
export function tokenizeBashCommand(command: string): BashToken[] {
  const tokens: BashToken[] = []
  let index = 0
  let expects: 'command' | 'path' | 'argument' = 'command'

  while (index < command.length) {
    const char = command[index] ?? ''

    if (isWhitespace(char)) {
      const text = readWhile(command, index, isWhitespace)
      if (text.includes('\n')) expects = 'command'
      tokens.push({ kind: 'whitespace', text })
      index += text.length
      continue
    }

    if (char === '#' && expects === 'command') {
      const text = readWhile(command, index, (candidate) => candidate !== '\n')
      tokens.push({ kind: 'comment', text })
      index += text.length
      continue
    }

    if (char === '"' || char === "'") {
      const text = readQuoted(command, index)
      tokens.push({ kind: 'string', text })
      index += text.length
      expects = 'argument'
      continue
    }

    if (char === '$' && command[index + 1] === '(') {
      tokens.push({ kind: 'operator', text: '$(' })
      index += 2
      expects = 'command'
      continue
    }

    if (char === '$') {
      const text = readVariable(command, index)
      tokens.push({ kind: 'variable', text })
      index += text.length
      expects = 'argument'
      continue
    }

    if (OPERATOR_CHARS.has(char)) {
      const text = readWhile(command, index, (candidate) => OPERATOR_CHARS.has(candidate))
      tokens.push({ kind: 'operator', text })
      index += text.length
      expects = REDIRECTIONS.has(text) ? 'path' : COMMAND_SEPARATORS.has(text) ? 'command' : 'argument'
      continue
    }

    const word = readWord(command, index)
    tokens.push({ kind: classifyWord(word, expects), text: word })
    index += word.length
    expects = expects === 'command' && (COMMAND_PREFIXES.has(word) || isAssignment(word)) ? 'command' : 'argument'
  }

  return tokens
}

function classifyWord(word: string, expects: 'command' | 'path' | 'argument'): BashTokenKind {
  if (word.startsWith('-')) return 'flag'
  if (expects === 'path') return 'path'
  if (expects === 'command') return isAssignment(word) ? 'variable' : 'command'
  if (/^\d+$/.test(word)) return 'number'
  if (isPathLike(word)) return 'path'
  return 'text'
}

function isAssignment(word: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*=/.test(word)
}

function isPathLike(word: string): boolean {
  return word.includes('/') || word.startsWith('~') || word.startsWith('*.')
}

function readWord(command: string, start: number): string {
  let end = start
  while (end < command.length) {
    const char = command[end] ?? ''
    if (isWhitespace(char) || OPERATOR_CHARS.has(char) || char === '"' || char === "'" || char === '$') break
    end++
  }
  return command.slice(start, end)
}

function readQuoted(command: string, start: number): string {
  const quote = command[start]
  let end = start + 1
  while (end < command.length) {
    const char = command[end]
    if (char === '\\') {
      end += 2
      continue
    }
    end++
    if (char === quote) break
  }
  return command.slice(start, end)
}

function readVariable(command: string, start: number): string {
  if (command[start + 1] === '{') {
    const close = command.indexOf('}', start)
    return close === -1 ? command.slice(start) : command.slice(start, close + 1)
  }
  const name = readWhile(command, start + 1, (candidate) => /[A-Za-z0-9_?!#@*]/.test(candidate))
  return `$${name}`
}

function readWhile(command: string, start: number, predicate: (char: string) => boolean): string {
  let end = start
  while (end < command.length && predicate(command[end] ?? '')) end++
  return command.slice(start, end)
}

function isWhitespace(char: string): boolean {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r'
}
