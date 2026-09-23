import verbs from './verbs.json'
import type { ExtensionAPI, ExtensionContext } from '@earendil-works/pi-coding-agent'

export const DOTS_SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
export const SPINNER_INTERVAL_MS = 80
export const PHRASE_ROTATION_MS = 8_000
export const SHIMMER_FRAME_MS = 80
export const SHIMMER_SWEEP_MS = 2_000

const RESET_FG = '\x1b[39m'
const BASE_RGB: RGB = [128, 128, 128]
const HIGHLIGHT_RGB: RGB = [230, 230, 230]

type RGB = [number, number, number]
type Rng = () => number

export default function workingDisplayExtension(pi: ExtensionAPI): void {
  const controller = createWorkingDisplayController()

  pi.on('agent_start', (_event, ctx) => {
    controller.start(ctx)
  })

  pi.on('agent_end', (_event, ctx) => {
    controller.stop(ctx)
  })

  pi.on('session_shutdown', () => {
    controller.stop()
  })
}

export function createWorkingDisplayController(options: {
  phrases?: readonly string[]
  phraseRotationMs?: number
  shimmerFrameMs?: number
  now?: () => number
} = {}): {
  start(ctx: ExtensionContext): void
  stop(ctx?: ExtensionContext): void
} {
  const phrases = options.phrases ?? verbs
  const phraseRotationMs = options.phraseRotationMs ?? PHRASE_ROTATION_MS
  const shimmerFrameMs = options.shimmerFrameMs ?? SHIMMER_FRAME_MS
  const now = options.now ?? Date.now
  const rotator = createPhraseRotator(phrases)

  let activeCtx: ExtensionContext | undefined
  let currentPhrase = ''
  let phraseStartedAt = 0
  let phraseTimer: ReturnType<typeof setInterval> | undefined
  let shimmerTimer: ReturnType<typeof setInterval> | undefined

  function clearTimers(): void {
    if (phraseTimer) clearInterval(phraseTimer)
    if (shimmerTimer) clearInterval(shimmerTimer)
    phraseTimer = undefined
    shimmerTimer = undefined
  }

  function render(): void {
    if (!activeCtx?.hasUI) return
    activeCtx.ui.setWorkingMessage(renderCodexShimmer(formatWorkingPhrase(currentPhrase), now() - phraseStartedAt))
  }

  function advancePhrase(): void {
    currentPhrase = rotator.nextPhrase()
    phraseStartedAt = now()
    render()
  }

  function stop(ctx?: ExtensionContext): void {
    clearTimers()
    const restoreCtx = ctx ?? activeCtx
    if (restoreCtx?.hasUI) {
      restoreCtx.ui.setWorkingMessage()
      restoreCtx.ui.setWorkingIndicator()
      restoreCtx.ui.setHiddenThinkingLabel()
    }
    activeCtx = undefined
  }

  return {
    start(ctx: ExtensionContext): void {
      stop(ctx)
      activeCtx = ctx
      rotator.reset()
      if (!ctx.hasUI) return

      ctx.ui.setHiddenThinkingLabel('Thinking')
      ctx.ui.setWorkingIndicator({
        frames: DOTS_SPINNER_FRAMES.map((frame) => ctx.ui.theme.fg('accent', frame)),
        intervalMs: SPINNER_INTERVAL_MS,
      })

      advancePhrase()
      shimmerTimer = setInterval(render, Math.max(1, shimmerFrameMs))
      phraseTimer = setInterval(advancePhrase, Math.max(1, phraseRotationMs))
    },
    stop,
  }
}

export function createPhraseRotator(phrases: readonly string[], rng: Rng = Math.random): {
  nextPhrase(): string
  reset(): void
} {
  const normalized = phrases.map(normalizePhrase).filter((phrase) => phrase.length > 0)
  let queue: string[] = []
  let index = 0
  let lastPhrase: string | undefined

  function refillQueue(): void {
    queue = shuffledCopy(normalized, rng)
    index = 0

    if (!lastPhrase || queue.length <= 1 || queue[0] !== lastPhrase) return
    const swapIndex = queue.findIndex((phrase, phraseIndex) => phraseIndex > 0 && phrase !== lastPhrase)
    if (swapIndex > 0) {
      ;[queue[0], queue[swapIndex]] = [queue[swapIndex]!, queue[0]!]
    }
  }

  return {
    nextPhrase(): string {
      if (normalized.length === 0) return 'Working'
      if (index >= queue.length) refillQueue()
      const phrase = queue[index] ?? 'Working'
      index += 1
      lastPhrase = phrase
      return phrase
    },
    reset(): void {
      lastPhrase = undefined
      refillQueue()
    },
  }
}

export function renderCodexShimmer(
  text: string,
  elapsedMs: number,
  options: { base?: RGB; highlight?: RGB; sweepMs?: number } = {},
): string {
  if (text.length === 0) return ''

  const base = options.base ?? BASE_RGB
  const highlight = options.highlight ?? HIGHLIGHT_RGB
  const sweepMs = options.sweepMs ?? SHIMMER_SWEEP_MS
  const graphemes = [...text]
  const width = graphemes.length
  const halfWidth = Math.max(width * 0.1, 3)
  const position = ((elapsedMs % sweepMs) / sweepMs) * (width + 2 * halfWidth) - halfWidth

  return graphemes
    .map((grapheme, index) => {
      const center = index + 0.5
      const distance = Math.min(Math.abs(center - position) / halfWidth, 1)
      const intensity = 0.5 * (1 + Math.cos(Math.PI * distance))
      const alpha = 0.5 + 0.5 * intensity
      const [r, g, b] = blend(base, highlight, alpha)
      return `\x1b[38;2;${r};${g};${b}m${grapheme}`
    })
    .join('') + RESET_FG
}

export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '')
}

export function formatWorkingPhrase(phrase: string): string {
  const normalized = normalizePhrase(phrase)
  return normalized.length > 0 ? `${normalized}…` : 'Working…'
}

function normalizePhrase(phrase: string): string {
  return phrase.trim().replace(/\s*(?:\.\.\.|…)\s*$/, '')
}

function shuffledCopy<T>(items: readonly T[], rng: Rng): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!]
  }
  return copy
}

function blend(a: RGB, b: RGB, t: number): RGB {
  const clamped = Math.max(0, Math.min(1, t))
  return [
    Math.round(a[0] + (b[0] - a[0]) * clamped),
    Math.round(a[1] + (b[1] - a[1]) * clamped),
    Math.round(a[2] + (b[2] - a[2]) * clamped),
  ]
}
