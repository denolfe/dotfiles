import { describe, expect, test } from 'bun:test'
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent'
import bashDisplayExtension from '../index'

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

function renderCall(tool: any, args: unknown, expanded = false): string {
  return tool.renderCall(args, theme, { lastComponent: undefined, expanded }).render(80)
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
    // Results keep Pi's own rendering, so no renderResult is installed.
    expect(tool.renderResult).toBeUndefined()
  })

  test('delegates execution to the Pi builtin for the active working directory', async () => {
    const tool = registerExtension()

    const result = await tool.execute('call-1', { command: 'echo bash-display' }, undefined, undefined, { cwd: '/tmp' })

    expect(JSON.stringify(result)).toContain('bash-display')
  })

  test('renders the command inline after the tool title', () => {
    const tool = registerExtension()

    expect(renderCall(tool, { command: 'grep -rn "foo" src/ | head -20' }))
      .toBe('Bash(grep -rn "foo" src/ | head -20)')
  })

  test('collapses long commands and shows them all when expanded', () => {
    const tool = registerExtension()
    const command = ['cd /tmp', 'ls -la', 'echo one', 'echo two'].join('\n')

    expect(renderCall(tool, { command })).toBe(
      ['Bash(cd /tmp', 'ls -la', 'echo one', '… 1 more line)'].join('\n'),
    )
    expect(renderCall(tool, { command }, true)).toBe(
      ['Bash(cd /tmp', 'ls -la', 'echo one', 'echo two)'].join('\n'),
    )
  })

  test('falls back to the bare title when no command is present', () => {
    const tool = registerExtension()

    expect(renderCall(tool, {})).toBe('Bash')
  })
})
