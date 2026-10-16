import { describe, expect, test } from 'bun:test'
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent'
import readDisplayExtension from '../index'

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '')
}

const theme = {
  fg: (_color: string, text: string) => text,
  bold: (text: string) => text,
}

function registerExtension(): any {
  const registered = new Map<string, any>()
  readDisplayExtension({
    registerTool(tool: any) {
      registered.set(tool.name, tool)
    },
  } as unknown as ExtensionAPI)
  return registered.get('read')
}

function renderCall(tool: any, args: unknown): string {
  return tool.renderCall(args, theme, { lastComponent: undefined }).render(80)
    .map((line: string) => stripAnsi(line).trimEnd())
    .join('\n')
    .trimEnd()
}

describe('read display extension adapter', () => {
  test('preserves Pi read metadata while installing only presentation overrides', () => {
    const tool = registerExtension()

    expect(tool.name).toBe('read')
    expect(tool.label).toBe('read')
    expect(tool.description).toBeTruthy()
    expect(tool.parameters).toBeTruthy()
    expect(tool.renderShell).toBe('default')
    expect(tool.renderCall).toBeFunction()
    expect(tool.renderResult).toBeFunction()
  })

  test('renders a capitalized title with the requested range', () => {
    const tool = registerExtension()
    expect(renderCall(tool, { path: 'src/demo.ts', offset: 10, limit: 20 })).toBe('Read src/demo.ts:10-29')
  })

  test.each([
    { caseName: 'omitted offset', args: { path: 'src/demo.ts' } },
    { caseName: 'explicit offset 1', args: { path: 'src/demo.ts', offset: 1 } },
  ])('shows only the path for a full-file read with $caseName', ({ args }) => {
    const tool = registerExtension()
    expect(renderCall(tool, args)).toBe('Read src/demo.ts')

    const component = tool.renderResult(
      { content: [{ type: 'text', text: 'alpha\nbravo\ncharlie' }] },
      { isPartial: false },
      theme,
      { args, isError: false },
    )
    expect(component.render(80).join('').trim()).toBe('')
  })

  test('keeps line numbers and a preview for a limited read from line one', () => {
    const tool = registerExtension()
    expect(renderCall(tool, { path: 'src/demo.ts', offset: 1, limit: 2 })).toBe('Read src/demo.ts:1-2')

    const component = tool.renderResult(
      { content: [{ type: 'text', text: 'alpha\nbravo' }] },
      { isPartial: false },
      theme,
      { args: { path: 'src/demo.ts', offset: 1, limit: 2 }, isError: false },
    )
    expect(component.render(80).map((line: string) => stripAnsi(line).trimEnd()).join('\n')).toBe('  1 │ alpha\n  2 │ bravo')
  })

  test('renders the first five read result lines with line numbers', () => {
    const tool = registerExtension()
    const component = tool.renderResult(
      { content: [{ type: 'text', text: 'alpha\n\nbravo\ncharlie\ndelta\necho\n[10 more lines in file. Use offset=16 to continue.]' }] },
      { isPartial: false },
      theme,
      { args: { path: 'src/demo.ts', offset: 10 }, isError: false },
    )

    expect(component.render(80).map((line: string) => stripAnsi(line).trimEnd()).join('\n').trimEnd()).toBe([
      '  10 │ alpha',
      '  11 │',
      '  12 │ bravo',
      '  13 │ charlie',
      '  14 │ delta',
    ].join('\n'))
  })

  test('retains the vertical bar on wrapped preview lines', () => {
    const tool = registerExtension()
    const component = tool.renderResult(
      { content: [{ type: 'text', text: 'alpha bravo charlie delta' }] },
      { isPartial: false },
      theme,
      { args: { path: 'src/demo.ts', offset: 7 }, isError: false },
    )

    expect(component.render(13).map((line: string) => stripAnsi(line).trimEnd()).join('\n').trimEnd()).toBe([
      '  7 │ alpha',
      '    │ bravo',
      '    │ charlie',
      '    │ delta',
    ].join('\n'))
  })
})
