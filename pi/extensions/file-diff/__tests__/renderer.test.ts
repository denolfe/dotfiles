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

function render(diff: string, options: { expanded?: boolean; filePath?: string; width?: number } = {}): string[] {
  const component = renderCompletedDiff(
    { diff },
    {
      expanded: options.expanded ?? false,
      filePath: options.filePath ?? 'demo.ts',
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

  test('shows 50 collapsed diff rows before hiding the rest', () => {
    const body = Array.from({ length: 60 }, (_, index) => `+line ${index + 1}`)
    const diff = ['@@ -0,0 +1,60 @@', ...body].join('\n')

    const collapsed = render(diff, { width: 80 }).join('\n')
    const expanded = render(diff, { width: 80, expanded: true }).join('\n')

    expect(collapsed).toContain('line 49')
    expect(collapsed).not.toContain('line 50')
    expect(collapsed).toContain('more diff lines')
    expect(expanded).toContain('line 60')
  })

  test('returns a stable fallback when no diff payload exists', () => {
    const component = renderCompletedDiff({}, { expanded: false, filePath: 'demo.ts' }, theme)
    expect(component.render(80).map(stripAnsi).join('\n')).toContain('no diff payload')
  })
})
