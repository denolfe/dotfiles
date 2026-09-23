import { describe, expect, test } from 'bun:test'
import { highlightBashCommand, tokenizeBashCommand, type BashToken } from '../highlight'

const theme = {
  fg: (color: string, text: string) => `<${color}>${text}</${color}>`,
}

function significant(command: string): Array<[string, string]> {
  return tokenizeBashCommand(command)
    .filter((token: BashToken) => token.kind !== 'whitespace')
    .map((token): [string, string] => [token.kind, token.text])
}

describe('bash tokenizer', () => {
  test('classifies the command head by position, not by keyword list', () => {
    expect(significant('ls -la')).toEqual([
      ['command', 'ls'],
      ['flag', '-la'],
    ])
    expect(significant('bun test extensions/file-diff')).toEqual([
      ['command', 'bun'],
      ['text', 'test'],
      ['path', 'extensions/file-diff'],
    ])
  })

  test('starts a new command after a separator', () => {
    expect(significant('grep -rn "foo" src/ | head -20')).toEqual([
      ['command', 'grep'],
      ['flag', '-rn'],
      ['string', '"foo"'],
      ['path', 'src/'],
      ['operator', '|'],
      ['command', 'head'],
      ['flag', '-20'],
    ])
    expect(significant('git fetch && git status')).toEqual([
      ['command', 'git'],
      ['text', 'fetch'],
      ['operator', '&&'],
      ['command', 'git'],
      ['text', 'status'],
    ])
  })

  test('treats redirection targets as paths', () => {
    expect(significant('bun run build > logs/out.txt')).toEqual([
      ['command', 'bun'],
      ['text', 'run'],
      ['text', 'build'],
      ['operator', '>'],
      ['path', 'logs/out.txt'],
    ])
  })

  test('reads quoted strings, variables, and comments whole', () => {
    expect(significant('echo "hi $USER" # greet')).toEqual([
      ['command', 'echo'],
      ['string', '"hi $USER"'],
      ['text', '#'],
      ['text', 'greet'],
    ])
    expect(significant('# comment only')).toEqual([
      ['comment', '# comment only'],
    ])
    expect(significant('echo ${HOME}/bin')).toEqual([
      ['command', 'echo'],
      ['variable', '${HOME}'],
      ['path', '/bin'],
    ])
    expect(significant("sed -n '1,5p' file.ts")).toEqual([
      ['command', 'sed'],
      ['flag', '-n'],
      ['string', "'1,5p'"],
      ['text', 'file.ts'],
    ])
  })

  test('keeps looking for a command head after a wrapper word', () => {
    expect(significant('sudo systemctl restart nginx')).toEqual([
      ['command', 'sudo'],
      ['command', 'systemctl'],
      ['text', 'restart'],
      ['text', 'nginx'],
    ])
  })

  test('marks leading assignments as variables', () => {
    expect(significant('DEBUG=1 bun test')).toEqual([
      ['variable', 'DEBUG=1'],
      ['command', 'bun'],
      ['text', 'test'],
    ])
  })

  test('starts a new command inside a substitution and on a new line', () => {
    expect(significant('echo $(git rev-parse HEAD)')).toEqual([
      ['command', 'echo'],
      ['operator', '$('],
      ['command', 'git'],
      ['text', 'rev-parse'],
      ['text', 'HEAD'],
      ['operator', ')'],
    ])
    expect(significant('cd /tmp\nls')).toEqual([
      ['command', 'cd'],
      ['path', '/tmp'],
      ['command', 'ls'],
    ])
  })

  test('never drops or reorders input characters', () => {
    for (const command of [
      'ls -la',
      'grep -rn "foo" src/ | head -20',
      'if [ -f x ]; then echo "hi $USER"; fi',
      'git commit -m "feat: thing" && git push',
      'awk \'{print $1}\' file | sort -u > out.txt',
      'find . -name "*.ts" -exec rm {} \\;',
    ]) {
      expect(tokenizeBashCommand(command).map((token) => token.text).join('')).toBe(command)
    }
  })
})

describe('bash highlighter', () => {
  test('colors each token kind through the theme', () => {
    expect(highlightBashCommand('git push -f', theme)).toBe(
      '<syntaxFunction>git</syntaxFunction> <text>push</text> <syntaxKeyword>-f</syntaxKeyword>',
    )
  })

  test('leaves whitespace unstyled so wrapping stays predictable', () => {
    expect(highlightBashCommand('  ls  ', theme)).toBe('  <syntaxFunction>ls</syntaxFunction>  ')
  })
})
