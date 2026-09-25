import { describe, expect, test } from 'bun:test'
import workingDisplayExtension, {
  COMPLETION_NOTIFICATION_AFTER_MS,
  DOTS_SPINNER_FRAMES,
  PHRASE_ROTATION_MS,
  SPINNER_INTERVAL_MS,
  createPhraseRotator,
  createWorkingDisplayController,
  estimateTokenCount,
  formatDuration,
  formatStatusParts,
  formatWorkingPhrase,
  renderCodexShimmer,
  renderWorkingMessage,
  stripAnsi,
} from '../index'
import verbs from '../verbs.json'

function createMockContext() {
  const calls: Record<string, any[]> = {
    setWorkingMessage: [],
    setWorkingIndicator: [],
    setHiddenThinkingLabel: [],
    notify: [],
  }

  const ctx = {
    hasUI: true,
    ui: {
      theme: {
        fg: (color: string, text: string) => `<${color}>${text}</${color}>`,
      },
      setWorkingMessage: (...args: any[]) => calls.setWorkingMessage.push(args),
      setWorkingIndicator: (...args: any[]) => calls.setWorkingIndicator.push(args),
      setHiddenThinkingLabel: (...args: any[]) => calls.setHiddenThinkingLabel.push(args),
      notify: (...args: any[]) => calls.notify.push(args),
    },
  }

  return { ctx, calls }
}

function lastConfiguredMessage(calls: Record<string, any[]>): string {
  return calls.setWorkingMessage.filter((args) => args.length > 0).at(-1)?.[0]
}

describe('working display extension', () => {
  test('registers lifecycle handlers', () => {
    const handlers: Record<string, Function> = {}

    workingDisplayExtension({
      on(event: string, handler: Function) {
        handlers[event] = handler
      },
    } as any)

    expect(handlers.agent_start).toBeFunction()
    expect(handlers.message_update).toBeFunction()
    expect(handlers.tool_execution_start).toBeFunction()
    expect(handlers.tool_execution_end).toBeFunction()
    expect(handlers.agent_end).toBeFunction()
    expect(handlers.session_shutdown).toBeFunction()
  })

  test('starts dots spinner, hidden thinking label, and shimmering phrase', () => {
    const { ctx, calls } = createMockContext()
    const controller = createWorkingDisplayController({ phrases: ['Working'], phraseRotationMs: 60_000 })

    controller.start(ctx as any)
    controller.stop(ctx as any)

    expect(calls.setHiddenThinkingLabel).toContainEqual(['Thinking'])
    const configuredIndicator = calls.setWorkingIndicator.find((args) => args.length > 0)?.[0]
    expect(configuredIndicator).toEqual({
      frames: DOTS_SPINNER_FRAMES.map((frame) => `<accent>${frame}</accent>`),
      intervalMs: SPINNER_INTERVAL_MS,
    })
    const configuredMessage = calls.setWorkingMessage.find((args) => args.length > 0)?.[0]
    expect(stripAnsi(configuredMessage)).toBe('Working… (0s)')
  })

  test('restores Pi defaults when stopped', () => {
    const { ctx, calls } = createMockContext()
    const controller = createWorkingDisplayController({ phrases: ['Working'], phraseRotationMs: 60_000 })

    controller.start(ctx as any)
    controller.stop(ctx as any)

    expect(calls.setWorkingMessage.at(-1)).toEqual([])
    expect(calls.setWorkingIndicator.at(-1)).toEqual([])
    expect(calls.setHiddenThinkingLabel.at(-1)).toEqual([])
  })

  test('uses an 8 second phrase cadence by default', () => {
    expect(PHRASE_ROTATION_MS).toBe(8_000)
  })

  test('phrase rotator shuffles and avoids immediate repeats across refills', () => {
    const rotator = createPhraseRotator(['alpha', 'bravo'], () => 0)

    expect([rotator.nextPhrase(), rotator.nextPhrase(), rotator.nextPhrase()]).toEqual([
      'bravo',
      'alpha',
      'bravo',
    ])
  })

  test('shimmer preserves plain text after stripping ANSI', () => {
    const rendered = renderCodexShimmer('Warping out', 500)

    expect(stripAnsi(rendered)).toBe('Warping out')
    expect(rendered).toContain('\x1b[38;2;')
  })

  test('formats working phrases with a single ellipsis', () => {
    expect(formatWorkingPhrase('Warping out')).toBe('Warping out…')
    expect(formatWorkingPhrase('Warping out...')).toBe('Warping out…')
    expect(formatWorkingPhrase('Warping out…')).toBe('Warping out…')
  })

  test('copies user verbs into the extension with typo fixed', () => {
    expect(verbs).toContain('Setting phasers to stun')
    expect(verbs).not.toContain('Seting phasers to stun')
  })

  test('formats token counts and elapsed time status', () => {
    expect(estimateTokenCount(399)).toBe(100)
    expect(formatDuration(65_000)).toBe('1m 05s')
    expect(formatStatusParts(0, 0)).toEqual(['0s'])
    expect(formatStatusParts(29_999, 1234)).toEqual(['29s', '↓ 1,234 tokens'])
    expect(formatStatusParts(17_000, 604, true)).toEqual(['17s', '↓ 604 tokens', 'thinking'])
  })

  test('tracks live token estimates from streamed text deltas', () => {
    let time = 0
    const { ctx, calls } = createMockContext()
    const controller = createWorkingDisplayController({ phrases: ['Working'], now: () => time })

    controller.start(ctx as any)
    controller.handleMessageUpdate({ type: 'text_start' }, ctx as any)
    controller.handleMessageUpdate({ type: 'text_delta', delta: 'a'.repeat(40) }, ctx as any)

    expect(stripAnsi(lastConfiguredMessage(calls))).toBe('Working… (0s · ↓ 10 tokens)')
    controller.stop(ctx as any)
  })

  test('uses final output usage when available', () => {
    const { ctx, calls } = createMockContext()
    const controller = createWorkingDisplayController({ phrases: ['Working'] })

    controller.start(ctx as any)
    controller.handleMessageUpdate({ type: 'text_delta', delta: 'a'.repeat(40) }, ctx as any)
    controller.handleMessageUpdate({ type: 'done', message: { usage: { output: 17 } } }, ctx as any)

    expect(stripAnsi(lastConfiguredMessage(calls))).toBe('Working… (0s · ↓ 17 tokens)')
    controller.stop(ctx as any)
  })

  test('shows thinking while reasoning is active', () => {
    let time = 1
    const { ctx, calls } = createMockContext()
    const controller = createWorkingDisplayController({ phrases: ['Ludicrous speed'], now: () => time })

    controller.start(ctx as any)
    time = 17_001
    controller.handleMessageUpdate({ type: 'text_delta', delta: 'a'.repeat(2_416) }, ctx as any)
    controller.handleMessageUpdate({ type: 'thinking_start' }, ctx as any)

    expect(stripAnsi(lastConfiguredMessage(calls))).toBe('Ludicrous speed… (17s · ↓ 604 tokens · thinking)')

    controller.handleMessageUpdate({ type: 'thinking_end' }, ctx as any)
    expect(stripAnsi(lastConfiguredMessage(calls))).toBe('Ludicrous speed… (17s · ↓ 604 tokens)')
    controller.stop(ctx as any)
  })

  test('updates elapsed time from the start', () => {
    let time = 1
    const { ctx, calls } = createMockContext()
    const controller = createWorkingDisplayController({ phrases: ['Working'], now: () => time })

    controller.start(ctx as any)
    time = 5_001
    controller.handleMessageUpdate({ type: 'text_delta', delta: 'a'.repeat(8) }, ctx as any)

    expect(stripAnsi(lastConfiguredMessage(calls))).toBe('Working… (5s · ↓ 2 tokens)')
    controller.stop(ctx as any)
  })


  test('shows completion notification only for runs longer than ten seconds', () => {
    let time = 0
    const { ctx, calls } = createMockContext()
    const controller = createWorkingDisplayController({ phrases: ['Working'], now: () => time })

    controller.start(ctx as any)
    time = COMPLETION_NOTIFICATION_AFTER_MS - 1
    controller.complete(ctx as any)
    expect(calls.notify).toEqual([])

    controller.start(ctx as any)
    time += COMPLETION_NOTIFICATION_AFTER_MS
    controller.complete(ctx as any)
    expect(calls.notify.at(-1)).toEqual(['• Worked for 10s', 'info'])
  })

  test('renders a complete working message with status', () => {
    const rendered = renderWorkingMessage({
      phrase: 'Warping out',
      phraseElapsedMs: 500,
      elapsedMs: 65_000,
      tokens: 1234,
      thinking: true,
    })

    expect(stripAnsi(rendered)).toBe('Warping out… (1m 05s · ↓ 1,234 tokens · thinking)')
  })
})
