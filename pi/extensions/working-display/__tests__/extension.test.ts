import { describe, expect, test } from 'bun:test'
import workingDisplayExtension, {
  DOTS_SPINNER_FRAMES,
  PHRASE_ROTATION_MS,
  SPINNER_INTERVAL_MS,
  createPhraseRotator,
  createWorkingDisplayController,
  formatWorkingPhrase,
  renderCodexShimmer,
  stripAnsi,
} from '../index'
import verbs from '../verbs.json'

function createMockContext() {
  const calls: Record<string, any[]> = {
    setWorkingMessage: [],
    setWorkingIndicator: [],
    setHiddenThinkingLabel: [],
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
    },
  }

  return { ctx, calls }
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
    expect(stripAnsi(configuredMessage)).toBe('Working…')
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
})
