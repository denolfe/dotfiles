import { afterEach, describe, expect, test } from 'bun:test'
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent'
import { visibleWidth } from '@earendil-works/pi-tui'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import fileDiffExtension from '../index'

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '')
}

const temporaryDirectories: string[] = []
const theme = {
  fg: (_color: string, text: string) => text,
  bg: (_color: string, text: string) => text,
  bold: (text: string) => text,
}

function registerExtension(name: 'edit' | 'write'): any {
  const registered = new Map<string, any>()
  fileDiffExtension({
    registerTool(tool: any) {
      registered.set(tool.name, tool)
    },
  } as unknown as ExtensionAPI)
  return registered.get(name)
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })))
})

describe('edit diff extension adapter', () => {
  test('preserves Pi edit metadata while installing only presentation overrides', () => {
    const tool = registerExtension('edit')

    expect(tool.name).toBe('edit')
    expect(tool.label).toBe('edit')
    expect(tool.description).toBeTruthy()
    expect(tool.parameters).toBeTruthy()
    expect(tool.prepareArguments).toBeFunction()
    expect(tool.renderShell).toBe('self')
    expect(tool.renderCall).toBeFunction()
    expect(tool.renderResult).toBeFunction()
  })

  test('delegates execution to Pi builtins for the active working directory', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'pi-file-diff-'))
    temporaryDirectories.push(cwd)
    const path = join(cwd, 'demo.txt')
    await writeFile(path, 'status: before\n')
    const tool = registerExtension('edit')

    const result = await tool.execute(
      'call-1',
      {
        path: 'demo.txt',
        edits: [{ oldText: 'status: before', newText: 'status: after' }],
      },
      undefined,
      undefined,
      { cwd },
    )

    expect(await readFile(path, 'utf8')).toBe('status: after\n')
    expect(result.details?.diff).toMatch(/^-\d+ status: before$/m)
    expect(result.details?.diff).toMatch(/^\+\d+ status: after$/m)
  })

  test('renders a compact call without a pending diff', () => {
    const tool = registerExtension('edit')
    const component = tool.renderCall(
      { path: 'src/demo.ts', oldText: 'before', newText: 'after' },
      theme,
      { lastComponent: undefined },
    )

    expect(stripAnsi(component.render(80).join('\n')).trim()).toBe('Edit src/demo.ts')
  })

  test('clamps long call paths to the available render width', () => {
    const tool = registerExtension('edit')
    const component = tool.renderCall(
      { path: '/Users/edenolf/.pi/agent/npm/node_modules/pi-codex-style-tools/index.ts' },
      theme,
      { lastComponent: undefined },
    )

    for (const line of component.render(122)) {
      expect(visibleWidth(line)).toBeLessThanOrEqual(122)
    }
  })

  test('routes completed diffs, failures, and no-diff results', () => {
    const tool = registerExtension('edit')
    const baseContext = {
      args: { path: 'demo.txt' },
      isError: false,
    }

    const diff = tool.renderResult(
      {
        content: [{ type: 'text', text: 'Updated demo.txt' }],
        details: { diff: '@@ -1 +1 @@\n-before\n+after' },
      },
      { expanded: false, isPartial: false },
      theme,
      baseContext,
    )
    expect(diff.render(80).join('\n')).toContain('after')

    const error = tool.renderResult(
      { content: [{ type: 'text', text: 'oldText not found' }], details: {} },
      { expanded: false, isPartial: false },
      theme,
      { ...baseContext, isError: true },
    )
    expect(error.render(80).join('\n')).toContain('oldText not found')

    const noDiff = tool.renderResult(
      { content: [{ type: 'text', text: 'Updated without diff' }], details: {} },
      { expanded: false, isPartial: false },
      theme,
      baseContext,
    )
    expect(noDiff.render(80).join('\n')).toContain('Updated without diff')
  })
})

describe('write diff extension adapter', () => {
  test('preserves Pi write metadata while installing only presentation overrides', () => {
    const tool = registerExtension('write')

    expect(tool.name).toBe('write')
    expect(tool.description).toBeTruthy()
    expect(tool.parameters).toBeTruthy()
    expect(tool.renderShell).toBe('self')
    expect(tool.renderCall).toBeFunction()
    expect(tool.renderResult).toBeFunction()
  })

  test('shows the created label and all added lines for a new file', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'pi-write-diff-'))
    temporaryDirectories.push(cwd)
    const tool = registerExtension('write')
    const args = { path: 'created.txt', content: 'alpha\nbravo\n' }

    const result = await tool.execute('call-new', args, undefined, undefined, { cwd })

    expect(await readFile(join(cwd, 'created.txt'), 'utf8')).toBe('alpha\nbravo\n')
    const output = renderWriteResult(tool, { result, args, cwd, toolCallId: 'call-new' })
    expect(output).toContain('created')
    expect(output).toContain('+2')
    expect(output).toContain('-0')
    expect(output).toContain('alpha')
    expect(output).toContain('bravo')
  })

  test('diffs against the previous content when overwriting a file', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'pi-write-diff-'))
    temporaryDirectories.push(cwd)
    await writeFile(join(cwd, 'demo.txt'), 'alpha\nbravo\ncharlie\n')
    const tool = registerExtension('write')
    const args = { path: 'demo.txt', content: 'alpha\ndelta\ncharlie\n' }

    const result = await tool.execute('call-overwrite', args, undefined, undefined, { cwd })

    const output = renderWriteResult(tool, { result, args, cwd, toolCallId: 'call-overwrite' })
    expect(output).toContain('overwritten')
    expect(output).toContain('+1')
    expect(output).toContain('-1')
    expect(output).toContain('bravo')
    expect(output).toContain('delta')
    expect(output).toContain('charlie')
  })

  test('renders a call line with line count and size', () => {
    const tool = registerExtension('write')
    const component = tool.renderCall(
      { path: 'src/demo.ts', content: 'alpha\nbravo\n' },
      theme,
      { lastComponent: undefined },
    )

    expect(stripAnsi(component.render(80).join('\n')).trim()).toBe('Write src/demo.ts (2 lines • 12B)')
  })

  test('falls back to Pi text when the write fails or content is unavailable', () => {
    const tool = registerExtension('write')
    const baseContext = { args: { path: 'demo.txt' }, cwd: '/tmp', toolCallId: 'call-x', state: {}, isError: false }

    const error = tool.renderResult(
      { content: [{ type: 'text', text: 'EACCES: permission denied' }], details: {} },
      { expanded: false, isPartial: false },
      theme,
      { ...baseContext, isError: true },
    )
    expect(error.render(80).join('\n')).toContain('EACCES: permission denied')

    const noContent = tool.renderResult(
      { content: [{ type: 'text', text: 'Wrote demo.txt' }], details: {} },
      { expanded: false, isPartial: false },
      theme,
      baseContext,
    )
    expect(noContent.render(80).join('\n')).toContain('Wrote demo.txt')
  })
})

function renderWriteResult(
  tool: any,
  context: { result: unknown; args: unknown; cwd: string; toolCallId: string },
): string {
  const component = tool.renderResult(
    context.result,
    { expanded: false, isPartial: false },
    theme,
    { args: context.args, cwd: context.cwd, toolCallId: context.toolCallId, state: {}, isError: false },
  )
  return component.render(80).map(stripAnsi).join('\n')
}
