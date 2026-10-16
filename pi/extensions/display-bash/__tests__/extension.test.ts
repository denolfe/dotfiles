import { describe, expect, test } from 'bun:test'
import { initTheme } from '@earendil-works/pi-coding-agent'
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent'
import { visibleWidth } from '@earendil-works/pi-tui'
import bashDisplayExtension from '../index'

initTheme('dark')

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '')
}

const theme = {
  fg: (_color: string, text: string) => text,
  bold: (text: string) => text,
}

function registerExtension(): any {
  const registered = new Map<string, any>()
  bashDisplayExtension({
    registerTool(tool: any) {
      registered.set(tool.name, tool)
    },
  } as unknown as ExtensionAPI)
  return registered.get('bash')
}

function renderCall(tool: any, args: unknown, expanded = false, width = 80): string {
  return tool.renderCall(args, theme, { lastComponent: undefined, expanded }).render(width)
    .map((line: string) => line.trimEnd())
    .join('\n')
    .trimEnd()
}

describe('bash display extension', () => {
  test('overrides only the call rendering and keeps Pi metadata', () => {
    const tool = registerExtension()

    expect(tool.name).toBe('bash')
    expect(tool.description).toBeTruthy()
    expect(tool.parameters).toBeTruthy()
    expect(tool.execute).toBeFunction()
    expect(tool.renderCall).toBeFunction()
    expect(tool.renderResult).toBeFunction()
  })

  test('delegates execution to the Pi builtin for the active working directory', async () => {
    const tool = registerExtension()

    const result = await tool.execute('call-1', { command: 'echo display-bash' }, undefined, undefined, { cwd: '/tmp' })

    expect(JSON.stringify(result)).toContain('display-bash')
  })

  test('renders the command after a shell prompt', () => {
    const tool = registerExtension()

    expect(renderCall(tool, { command: 'grep -rn "foo" src/ | head -20' }))
      .toBe('$ grep -rn "foo" src/ | head -20')
  })

  test('collapses long commands and shows them all when expanded', () => {
    const tool = registerExtension()
    const command = ['cd /tmp', 'ls -la', 'echo one', 'echo two'].join('\n')

    expect(renderCall(tool, { command })).toBe(
      ['$ cd /tmp', '  ls -la', '  echo one', '  … 1 more line'].join('\n'),
    )
    expect(renderCall(tool, { command }, true)).toBe(
      ['$ cd /tmp', '  ls -la', '  echo one', '  echo two'].join('\n'),
    )
  })

  test('indents visual wraps of a long command under the shell prompt', () => {
    const tool = registerExtension()
    expect(renderCall(tool, { command: 'printf alpha && printf beta && printf gamma && printf delta' }, false, 22))
      .toBe(['$ printf alpha &&', '  printf beta &&', '  printf gamma &&', '  printf delta'].join('\n'))
  })

  test('preserves highlighting across literal newlines in quoted strings', () => {
    const tool = registerExtension()
    const ansiTheme = {
      ...theme,
      fg: (color: string, text: string) => color === 'syntaxString' ? `\x1b[33m${text}\x1b[39m` : text,
    }
    const lines = tool.renderCall(
      { command: 'echo "first\nsecond"' }, ansiTheme,
      { lastComponent: undefined, expanded: false },
    ).render(30)
    expect(lines[1]).toContain('  \x1b[33msecond')
  })

  test('never exceeds narrow terminal widths with wide characters', () => {
    const tool = registerExtension()
    const lines = tool.renderCall(
      { command: '界界' }, theme,
      { lastComponent: undefined, expanded: false },
    ).render(3)
    expect(lines.every((line: string) => visibleWidth(line) <= 3)).toBe(true)
  })

  test('shows only the prompt when no command is present', () => {
    const tool = registerExtension()

    expect(renderCall(tool, {})).toBe('$')
  })

  test('indents every bash output line without indenting blank spacer lines', () => {
    const lines = renderResult('first\nsecond', { expanded: true })
    expect(lines).toContain('  first')
    expect(lines).toContain('  second')
    expect(lines[0]).toBe('')
  })

  test('indents Pi’s collapsed-output hint and keeps the last five lines', () => {
    const lines = renderResult('one\ntwo\nthree\nfour\nfive\nsix\nseven', { expanded: false })
    expect(lines.some((line) => line.startsWith('  ... (2 earlier lines,'))).toBe(true)
    expect(lines).toContain('  seven')
    expect(lines).not.toContain('  one')
  })

  test('fits indented output within a narrow terminal width', () => {
    const lines = renderResult('abcdefghijk', { expanded: true, width: 8 })
    expect(lines.some((line) => line.startsWith('  abcdef'))).toBe(true)
    expect(lines.every((line) => line.length <= 8)).toBe(true)
  })

  test('keeps native output updates and full-output notices indented', () => {
    const tool = registerExtension()
    const state = {}
    const context = { lastComponent: undefined, state, isError: false, showImages: false, invalidate() {} }
    const partial = tool.renderResult(
      { content: [{ type: 'text', text: 'working' }] },
      { isPartial: true, expanded: true }, theme, context,
    )
    expect(partial.render(80).map((line: string) => stripAnsi(line).trimEnd())).toContain('  working')

    const final = tool.renderResult(
      { content: [{ type: 'text', text: 'finished' }], details: { fullOutputPath: '/tmp/bash-output' } },
      { isPartial: false, expanded: true }, theme, { ...context, lastComponent: partial },
    )
    const lines = final.render(80).map((line: string) => stripAnsi(line).trimEnd())
    expect(lines).toContain('  finished')
    expect(lines.some((line: string) => line.startsWith('  [Full output: /tmp/bash-output]'))).toBe(true)
    expect(lines.join('\n')).not.toContain('working')
  })
})

function renderResult(output: string, { expanded, width = 80 }: { expanded: boolean; width?: number }): string[] {
  const tool = registerExtension()
  const component = tool.renderResult(
    { content: [{ type: 'text', text: output }] },
    { isPartial: false, expanded },
    theme,
    { lastComponent: undefined, state: {}, isError: false, showImages: false, invalidate() {} },
  )
  return component.render(width).map((line: string) => stripAnsi(line).trimEnd())
}
