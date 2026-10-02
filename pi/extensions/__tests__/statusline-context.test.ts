import { expect, test } from 'bun:test'

import statuslineExtension from '../statusline'

test('renders context as percentage and tokens without a bar or label', async () => {
  const output = await renderContext({ tokens: 64000, percent: 32 })
  expect(output).toContain('32% 64k')
  expect(output).not.toMatch(/[█▓▒░]/)
  expect(output).not.toContain('ctx')
})

test.each([
  { tokens: 0, percent: 0, rgb: '0;180;0' },
  { tokens: 75000, percent: 7.5, rgb: '110;180;0' },
  { tokens: 150000, percent: 15, rgb: '220;180;0' },
  { tokens: 475000, percent: 47.5, rgb: '220;150;0' },
  { tokens: 800000, percent: 80, rgb: '220;120;0' },
  { tokens: 850000, percent: 85, rgb: '220;90;0' },
  { tokens: 900000, percent: 90, rgb: '220;60;0' },
  { tokens: 1000000, percent: 100, rgb: '220;60;0' },
  { tokens: 150000, percent: 75, rgb: '220;180;0' },
  { tokens: 80000, percent: 80, rgb: '220;120;0' },
  { tokens: 90000, percent: 90, rgb: '220;60;0' },
  { tokens: 40000, percent: 40, rgb: '110;150;0' },
  { tokens: 75000, percent: 40, rgb: '110;150;0' },
  { tokens: 149999, percent: 14.9999, rgb: '220;180;0' },
  { tokens: 150001, percent: 15.0001, rgb: '220;180;0' },
  { tokens: 799999, percent: 79.9999, rgb: '220;120;0' },
  { tokens: 800001, percent: 80.0001, rgb: '220;120;0' },
  { tokens: 899999, percent: 89.9999, rgb: '220;60;0' },
  { tokens: 900001, percent: 90.0001, rgb: '220;60;0' },
  { tokens: 1200000, percent: 120, rgb: '220;60;0' },
])('interpolates warning color at $tokens tokens / $percent%', async ({ tokens, percent, rgb }) => {
  const output = await renderContext({ tokens, percent })
  expect(output).toContain(`\x1b[38;2;${rgb}m${Math.round(percent)}%`)
})

test('preserves unknown context and omits unavailable context', async () => {
  expect(await renderContext({ tokens: null, percent: null })).toContain('\x1b[90m?\x1b[0m')
  expect(await renderContext(undefined)).not.toContain('?')
})

test('uses the unrounded percentage for warning colors', async () => {
  const output = await renderContext({ tokens: 849000, percent: 84.9 })
  expect(output).toContain('\x1b[38;2;220;91;0m85% 849k')
})

async function renderContext(usage: { tokens: number | null; percent: number | null } | undefined) {
  let sessionStart: ((event: unknown, context: any) => Promise<void>) | undefined
  let footerFactory: ((tui: any, theme: any, data: any) => any) | undefined

  statuslineExtension({
    on(event: string, handler: typeof sessionStart) {
      if (event === 'session_start') sessionStart = handler
    },
    getThinkingLevel: () => 'off',
  } as never)

  await sessionStart?.({}, {
    cwd: process.cwd(),
    model: undefined,
    getContextUsage: () => usage,
    sessionManager: {
      getEntries: () => [],
      getSessionName: () => undefined,
    },
    ui: {
      setFooter(factory: typeof footerFactory) {
        footerFactory = factory
      },
    },
  })

  const footer = footerFactory?.(
    { requestRender() {} },
    {},
    {
      getExtensionStatuses: () => new Map(),
      onBranchChange: () => () => {},
    },
  )
  try {
    return footer?.render(120).join('\n') ?? ''
  } finally {
    footer?.dispose()
  }
}
