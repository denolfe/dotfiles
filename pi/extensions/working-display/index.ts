import verbs from './verbs.json'
import type { ExtensionAPI, ExtensionContext } from '@earendil-works/pi-coding-agent'

export const DOTS_SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
export const SPINNER_INTERVAL_MS = 80
export const PHRASE_ROTATION_MS = 8_000
export const SHIMMER_FRAME_MS = 80
export const SHIMMER_SWEEP_MS = 2_000
export const COMPLETION_NOTIFICATION_AFTER_MS = 10_000

const RESET_FG = '\x1b[39m'
const BASE_RGB: RGB = [128, 128, 128]
const HIGHLIGHT_RGB: RGB = [230, 230, 230]
interface AssistantMessageEventLike {
  type: string
  delta?: string
  content?: string
  message?: {
    usage?: { output?: number }
    content?: Array<{ type?: string; text?: string }>
  }
}

type RGB = [number, number, number]
type Rng = () => number

export default function workingDisplayExtension(pi: ExtensionAPI): void {
  const controller = createWorkingDisplayController()

  pi.on('agent_start', (_event, ctx) => {
    controller.start(ctx)
  })

  pi.on('message_update', (event, ctx) => {
    controller.handleMessageUpdate(event.assistantMessageEvent as AssistantMessageEventLike, ctx)
  })

  pi.on('tool_execution_start', (_event, ctx) => {
    controller.handleToolStart(ctx)
  })

  pi.on('tool_execution_end', (_event, ctx) => {
    controller.handleToolEnd(ctx)
  })

  pi.on('agent_end', (_event, ctx) => {
    controller.complete(ctx)
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
  handleMessageUpdate(event: AssistantMessageEventLike, ctx?: ExtensionContext): void
  handleToolStart(ctx?: ExtensionContext): void
  handleToolEnd(ctx?: ExtensionContext): void
  complete(ctx?: ExtensionContext): void
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
  let agentStartedAt = 0
  let responseChars = 0
  let finalOutputTokens: number | undefined
  let currentTextBlockChars = 0
  let thinkingActive = false
  let phraseTimer: ReturnType<typeof setInterval> | undefined
  let shimmerTimer: ReturnType<typeof setInterval> | undefined

  function clearTimers(): void {
    if (phraseTimer) clearInterval(phraseTimer)
    if (shimmerTimer) clearInterval(shimmerTimer)
    phraseTimer = undefined
    shimmerTimer = undefined
  }

  function updateContext(ctx?: ExtensionContext): void {
    if (ctx) activeCtx = ctx
  }

  function tokenCount(): number {
    return finalOutputTokens ?? estimateTokenCount(responseChars)
  }

  function elapsedMs(): number {
    return agentStartedAt > 0 ? Math.max(0, now() - agentStartedAt) : 0
  }

  function render(): void {
    if (!activeCtx?.hasUI) return
    activeCtx.ui.setWorkingMessage(renderWorkingMessage({
      phrase: currentPhrase,
      phraseElapsedMs: now() - phraseStartedAt,
      elapsedMs: elapsedMs(),
      tokens: tokenCount(),
      thinking: thinkingActive,
    }))
  }

  function advancePhrase(): void {
    currentPhrase = rotator.nextPhrase()
    phraseStartedAt = now()
    render()
  }

  function resetRunState(): void {
    responseChars = 0
    finalOutputTokens = undefined
    currentTextBlockChars = 0
    thinkingActive = false
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
    agentStartedAt = 0
    resetRunState()
  }

  return {
    start(ctx: ExtensionContext): void {
      stop(ctx)
      activeCtx = ctx
      agentStartedAt = now()
      resetRunState()
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
    handleMessageUpdate(event: AssistantMessageEventLike, ctx?: ExtensionContext): void {
      updateContext(ctx)
      switch (event.type) {
        case 'thinking_start':
          thinkingActive = true
          break
        case 'thinking_end':
          thinkingActive = false
          break
        case 'text_start':
          currentTextBlockChars = 0
          break
        case 'text_delta': {
          const deltaLength = typeof event.delta === 'string' ? event.delta.length : 0
          responseChars += deltaLength
          currentTextBlockChars += deltaLength
          break
        }
        case 'text_end': {
          if (typeof event.content === 'string') {
            const missing = event.content.length - currentTextBlockChars
            if (missing > 0) responseChars += missing
            currentTextBlockChars = event.content.length
          }
          break
        }
        case 'done':
          if (typeof event.message?.usage?.output === 'number') {
            finalOutputTokens = event.message.usage.output
          } else if (event.message?.content) {
            const finalChars = event.message.content.reduce((total, block) => (
              total + (block.type === 'text' && typeof block.text === 'string' ? block.text.length : 0)
            ), 0)
            if (finalChars > responseChars) responseChars = finalChars
          }
          break
      }
      render()
    },
    handleToolStart(ctx?: ExtensionContext): void {
      updateContext(ctx)
      render()
    },
    handleToolEnd(ctx?: ExtensionContext): void {
      updateContext(ctx)
      render()
    },
    complete(ctx?: ExtensionContext): void {
      const duration = elapsedMs()
      const notifyCtx = ctx ?? activeCtx
      stop(ctx)
      if (notifyCtx?.hasUI && duration >= COMPLETION_NOTIFICATION_AFTER_MS) {
        notifyCtx.ui.notify(`• Worked for ${formatDuration(duration)}`, 'info')
      }
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

export function renderWorkingMessage(options: {
  phrase: string
  phraseElapsedMs: number
  elapsedMs: number
  tokens: number
  thinking?: boolean
}): string {
  const statusParts = formatStatusParts(options.elapsedMs, options.tokens, options.thinking)
  const phrase = renderCodexShimmer(formatWorkingPhrase(options.phrase), options.phraseElapsedMs)

  return statusParts.length > 0 ? `${phrase} \x1b[90m(${statusParts.join(' · ')})${RESET_FG}` : phrase
}

export function formatStatusParts(elapsedMs: number, tokens: number, thinking = false): string[] {
  const parts = [formatDuration(elapsedMs)]
  if (tokens > 0) parts.push(`↓ ${formatCount(tokens)} tokens`)
  if (thinking) parts.push('thinking')
  return parts
}

export function estimateTokenCount(characters: number): number {
  return Math.round(Math.max(0, characters) / 4)
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1_000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return minutes > 0 ? `${minutes}m ${seconds.toString().padStart(2, '0')}s` : `${seconds}s`
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
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
