import { describe, expect, test } from 'bun:test'
import { visibleWidth } from '@earendil-works/pi-tui'
import { renderCompletedDiff } from '../renderer'

const theme = {
  fg: (_color: string, text: string) => text,
  bg: (_color: string, text: string) => text,
  bold: (text: string) => text,
}

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '')
}

function render(diff: string, options: { expanded?: boolean; filePath?: string; width?: number; pending?: boolean } = {}): string[] {
  const component = renderCompletedDiff(
    { diff },
    {
      expanded: options.expanded ?? false,
      filePath: options.filePath ?? 'demo.ts',
      previewMode: options.pending ? 'pending' : undefined,
    },
    theme,
  )
  return component.render(options.width ?? 80).map(stripAnsi)
}

describe('completed edit diff renderer', () => {
  test('renders a framed unified diff with statistics and line numbers', () => {
    const lines = render([
      '--- a/demo.ts',
      '+++ b/demo.ts',
      '@@ -1,2 +1,2 @@',
      '-const value = "before"',
      '+const value = "after"',
      ' console.log(value)',
    ].join('\n'))
    const output = lines.join('\n')

    expect(output).toContain('diff')
    expect(output).toContain('+1')
    expect(output).toContain('-1')
    expect(output).toContain('before')
    expect(output).toContain('after')
    expect(output).toMatch(/1\s+│/)
    expect(lines.filter((line) => /^\s*─+$/.test(line))).toHaveLength(2)
  })

  test('shows hashline anchors only when expanded', () => {
    const diff = [
      ' 1#ZP:alpha',
      '-2#  :beta',
      '+2#A1:bravo',
      ' 3#BC:gamma',
    ].join('\n')

    const collapsed = render(diff).join('\n')
    const expanded = render(diff, { expanded: true }).join('\n')

    expect(collapsed).not.toContain('1#ZP')
    expect(collapsed).toMatch(/1\s+│ alpha/)
    expect(expanded).toContain('1#ZP│ alpha')
    expect(expanded).toContain('2#A1│ bravo')
  })

  test('degrades to compact and summary output at narrow widths', () => {
    const diff = '@@ -1 +1 @@\n-old\n+new'

    const compact = render(diff, { width: 12 })
    const summary = render(diff, { width: 7 })

    expect(compact.join('\n')).toContain('diff')
    expect(summary.join('\n')).toContain('+1 -1')
    for (const [width, lines] of [[12, compact], [7, summary]] as const) {
      for (const line of lines) expect(visibleWidth(line)).toBeLessThanOrEqual(width)
    }
  })

  test('wraps and clamps every rendered line to the available width', () => {
    const lines = render(
      '@@ -1 +1 @@\n-a very long old value that cannot fit on one line\n+a very long new value that cannot fit on one line',
      { width: 32 },
    )

    expect(lines.length).toBeGreaterThan(6)
    for (const line of lines) expect(visibleWidth(line)).toBeLessThanOrEqual(32)
  })

  test('shows the first changed rows and marks later changes when the budget fills', () => {
    const body = Array.from({ length: 60 }, (_, index) => `+line ${index + 1}`)
    const diff = ['@@ -0,0 +1,60 @@', ...body].join('\n')

    const collapsedLines = render(diff, { width: 80 })
    const collapsed = collapsedLines.join('\n')
    const expanded = render(diff, { width: 80, expanded: true }).join('\n')

    expect(collapsedLines).toHaveLength(53) // 50 body rows, one summary, and two frame lines
    expect(collapsed).toContain('line 1 ')
    expect(collapsed).not.toContain('line 60')
    expect(collapsed).toContain('changed rows omitted')
    expect(expanded).toContain('line 60')
  })

  test('packs separate changes and marks skipped unchanged context', () => {
    const context = Array.from({ length: 75 }, (_, index) => ` unchanged ${index + 1}`)
    const diff = ['@@ -1,79 +1,79 @@', ' context before', '-old first', '+new first', ...context, '-old last', '+new last'].join('\n')

    const collapsed = render(diff).join('\n')
    const expanded = render(diff, { expanded: true }).join('\n')

    expect(collapsed).toContain('old first')
    expect(collapsed).toContain('new last')
    expect(collapsed).toContain('unchanged rows omitted')
    expect(collapsed).not.toContain('unchanged 40')
    expect(expanded).toContain('unchanged 40')
  })

  test('keeps nearby context when many changes still fit the finished budget', () => {
    const changes = Array.from({ length: 17 }, (_, index) => `+change ${index + 1}`)
    const diff = ['@@ -1,4 +1,21 @@', ' before one', ' before two', ...changes, ' after one', ' after two'].join('\n')

    const finished = render(diff).join('\n')

    expect(finished).toContain('before one')
    expect(finished).toContain('after two')
    expect(finished).not.toContain('rows omitted')
  })

  test('prioritizes early changes over context when the collapsed budget is tight', () => {
    const body = Array.from({ length: 28 }, (_, index) => [
      `+change ${index + 1}`,
      ...Array.from({ length: 4 }, (_, contextIndex) => ` context ${index + 1}.${contextIndex + 1}`),
    ]).flat()
    const diff = ['@@ -1,112 +1,140 @@', ...body].join('\n')

    const collapsed = render(diff).join('\n')

    expect(collapsed).toContain('change 20 ')
    expect(collapsed).not.toContain('change 28 ')
    expect(collapsed).toContain('changed rows omitted')
  })

  test('shows separate hunk headers when changes fit in the collapsed budget', () => {
    const diff = [
      '@@ -1 +1 @@', '-first old', '+first new',
      '@@ -90 +90 @@', '-last old', '+last new',
    ].join('\n')

    const collapsed = render(diff).join('\n')

    expect(collapsed).toContain('first new')
    expect(collapsed).toContain('@@ -90 +90 @@')
    expect(collapsed).toContain('last new')
  })

  test('pending shows only the latest changed block, while finished shows both', () => {
    const context = Array.from({ length: 80 }, (_, index) => {
      const lineNumber = index + 1
      if (lineNumber === 4 || lineNumber === 76) {
        return [`-demo line ${lineNumber}`, `+changed line ${lineNumber}`]
      }
      return [` demo line ${lineNumber}`]
    }).flat()
    const diff = ['@@ -1,80 +1,80 @@', ...context].join('\n')

    const pending = render(diff, { pending: true })
    const finished = render(diff)

    const pendingText = pending.join('\n')
    const finishedText = finished.join('\n')
    expect(pendingText).toContain('changed line 76')
    expect(pendingText).toContain('demo line 74')
    expect(pendingText).toContain('demo line 78')
    expect(pendingText).not.toContain('changed line 4 ')
    expect(pendingText).not.toContain('demo line 40')
    expect(pendingText).toContain('omitted above')
    expect(pending.length).toBeLessThan(15)
    expect(finishedText).toContain('changed line 4')
    expect(finishedText).toContain('changed line 76')
  })

  test('pending keeps whole nearby context lines when wrapping fits the budget', () => {
    const diff = [
      '@@ -1,3 +1,3 @@',
      ` START-CONTEXT-ONE ${'first '.repeat(65)}`,
      ` START-CONTEXT-TWO ${'second '.repeat(65)}`,
      '-old value',
      '+new value',
    ].join('\n')

    const pending = render(diff, { pending: true, width: 32 }).join('\n')

    expect(pending).toContain('START-CONTEXT-ONE')
    expect(pending).toContain('START-CONTEXT-TWO')
    expect(pending).toContain('new value')
  })

  test('counts both omission markers in the pending 50-row limit', () => {
    const changes = Array.from({ length: 49 }, (_, index) => `+change ${index + 1}`)
    const diff = ['@@ -0,2 +1,51 @@', ...changes, ' trailing one', ' trailing two'].join('\n')

    const pending = render(diff, { pending: true })

    expect(pending.length).toBeLessThanOrEqual(53)
    expect(pending.join('\n')).toContain('change 49')
  })

  test('pending keeps both ends of a changed line that exceeds the budget', () => {
    const diff = `@@ -0,0 +1 @@\n+START-OF-LATEST-CHANGE ${'middle '.repeat(200)} END-OF-LATEST-CHANGE`

    const pending = render(diff, { pending: true, width: 32 })
    const output = pending.join('\n')

    expect(output).toContain('START-OF-LATEST-CHANGE')
    expect(output).toContain('END-OF-LATEST-CHANGE')
    expect(output).toContain('omitted')
    expect(pending.length).toBeLessThanOrEqual(53)
  })

  test('pending preview does not fill its budget with unchanged rows', () => {
    const body = Array.from({ length: 75 }, (_, index) => ` context ${index + 1}`)
    const diff = ['@@ -1,75 +1,75 @@', ...body].join('\n')

    const pending = render(diff, { pending: true }).join('\n')

    expect(pending).toContain('No pending changes.')
    expect(pending).not.toContain('context 1 ')
  })

  test('pending preview follows the newest changed row in a long file', () => {
    const body = Array.from({ length: 75 }, (_, index) => `+line ${index + 1}`)
    const diff = ['@@ -0,0 +1,75 @@', ...body].join('\n')

    const collapsed = render(diff, { pending: true }).join('\n')
    const expanded = render(diff, { pending: true, expanded: true }).join('\n')

    expect(collapsed).toContain('line 75')
    expect(collapsed).not.toContain('line 1 ') // does not start at the first row
    expect(collapsed).toContain('omitted')
    expect(render(diff, { pending: true }).length).toBeLessThanOrEqual(53)
    expect(expanded).toContain('line 1 ')
  })

  test('keeps omission markers meaningful at compact widths', () => {
    const body = Array.from({ length: 80 }, (_, index) => `+line ${index + 1}`)
    const diff = ['@@ -0,0 +1,80 @@', ...body].join('\n')

    for (const pending of [false, true]) {
      const lines = render(diff, { width: 12, pending })
      expect(lines.join('\n')).toContain('hidden')
      for (const line of lines) expect(visibleWidth(line)).toBeLessThanOrEqual(12)
    }
  })

  test('reuses finished rendered rows until invalidation or resize', () => {
    const component = renderCompletedDiff(
      { diff: '@@ -1 +1 @@\n-old\n+new' },
      { expanded: false, filePath: 'demo.ts' },
      theme,
    )

    const first = component.render(80)
    expect(component.render(80)).toBe(first)

    component.invalidate?.()
    const refreshed = component.render(80)
    expect(refreshed).not.toBe(first)
    expect(refreshed).toEqual(first)

    const resized = component.render(64)
    expect(resized).not.toBe(refreshed)
    for (const line of resized) expect(visibleWidth(line)).toBeLessThanOrEqual(64)
  })

  test('returns a stable fallback when no diff payload exists', () => {
    const component = renderCompletedDiff({}, { expanded: false, filePath: 'demo.ts' }, theme)
    expect(component.render(80).map(stripAnsi).join('\n')).toContain('no diff payload')
  })
})
