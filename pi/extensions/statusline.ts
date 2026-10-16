import type { AssistantMessage } from '@earendil-works/pi-ai'
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent'
import { truncateToWidth, visibleWidth } from '@earendil-works/pi-tui'
import { execFile } from 'node:child_process'
import { homedir } from 'node:os'
import { basename, relative } from 'node:path'

const RESET = '\x1b[0m'
const DIM = '\x1b[2m'
const BLUE = '\x1b[34m'
const GREEN = '\x1b[32m'
const CYAN = '\x1b[36m'
const YELLOW = '\x1b[33m'
const RED = '\x1b[31m'
const MAGENTA = '\x1b[35m'
const GREY = '\x1b[90m'
const ORANGE = '\x1b[38;5;208m'
const PURPLE = '\x1b[38;5;135m'

const FOLDER_ICON = ''
const BRANCH_ICON = ''
const GIT_REFRESH_MS = 3000
const GIT_COMMAND_TIMEOUT_MS = 1000

function color(code: string, text: string): string {
  return `${code}${text}${RESET}`
}

function git(cwd: string, args: string[]): Promise<string | undefined> {
  return new Promise((resolve) => {
    execFile(
      'git',
      args,
      {
        cwd,
        encoding: 'utf8',
        timeout: GIT_COMMAND_TIMEOUT_MS,
        env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
      },
      (error, stdout) => {
        resolve(error ? undefined : stdout.trim())
      },
    )
  })
}

function formatDirectoryFromRoot(cwd: string, root: string | undefined): string {
  if (root && (cwd === root || cwd.startsWith(`${root}/`))) {
    const rel = relative(root, cwd)
    return rel ? `${basename(root)}/${rel}` : basename(root)
  }

  const home = homedir()
  return cwd === home ? '~' : cwd.startsWith(`${home}/`) ? `~${cwd.slice(home.length)}` : cwd
}

async function gitStatusSegments(cwd: string): Promise<string[]> {
  if (!(await git(cwd, ['rev-parse', '--is-inside-work-tree']))) return []

  const segments: string[] = []
  const branch =
    (await git(cwd, ['branch', '--show-current'])) || (await git(cwd, ['rev-parse', '--short', 'HEAD']))

  if (branch) {
    const prInfo = await git(cwd, ['config', '--get', `branch.${branch}.github-pr-owner-number`])
    if (prInfo) {
      const prNumber = prInfo.split('#')[2]
      const cache = await git(cwd, ['config', '--get', `branch.${branch}.github-pr-state-cache`])
      const prColor = cache?.split(':')[0] === 'MERGED' ? PURPLE : ORANGE
      if (prNumber) segments.push(color(prColor, `#${prNumber}`))
    }

    const status = (await git(cwd, ['status', '--porcelain'])) ?? ''
    let staged = 0
    let modified = 0
    let deleted = 0
    let untracked = 0

    for (const line of status.split('\n')) {
      if (!line) continue
      const x = line[0]
      const y = line[1]
      if (x && /[MADRC]/.test(x)) staged++
      if (y === 'M') modified++
      if (y === 'D') deleted++
      if (x === '?') untracked++
    }

    const branchSeg = color(status ? CYAN : GREEN, `${BRANCH_ICON} ${branch}`)
    const indicators: string[] = []
    if (await git(cwd, ['rev-parse', '--abbrev-ref', '@{upstream}'])) {
      const [aheadRaw, behindRaw] = await Promise.all([
        git(cwd, ['rev-list', '--count', '@{upstream}..HEAD']),
        git(cwd, ['rev-list', '--count', 'HEAD..@{upstream}']),
      ])
      const ahead = Number(aheadRaw ?? 0)
      const behind = Number(behindRaw ?? 0)
      if (behind > 0) indicators.push(color(CYAN, `↓${behind}`))
      if (ahead > 0) indicators.push(color(CYAN, `↑${ahead}`))
    }
    if (staged > 0) indicators.push(color(GREEN, `+${staged}`))
    if (modified > 0) indicators.push(color(YELLOW, `!${modified}`))
    if (deleted > 0) indicators.push(color(RED, `-${deleted}`))
    if (untracked > 0) indicators.push(color(RED, `?${untracked}`))

    segments.push(indicators.length ? `${branchSeg} ${indicators.join(' ')}` : branchSeg)
  }

  return segments
}

type GitCache = {
  directory: string
  gitSegments: string[]
}

async function refreshGitCache(cwd: string): Promise<GitCache> {
  const [root, gitSegments] = await Promise.all([
    git(cwd, ['rev-parse', '--show-toplevel']),
    gitStatusSegments(cwd),
  ])

  return {
    directory: `${FOLDER_ICON} ${formatDirectoryFromRoot(cwd, root)}`,
    gitSegments,
  }
}

function formatTokens(count: number): string {
  if (count < 1000) return count.toString()
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`
  if (count < 1000000) return `${Math.round(count / 1000)}k`
  if (count < 10000000) return `${(count / 1000000).toFixed(1)}M`
  return `${Math.round(count / 1000000)}M`
}

function contextSegment(
  usage: { tokens?: number | null; percent?: number | null } | undefined,
): string | undefined {
  if (usage?.percent == null) {
    return usage ? color(GREY, '?') : undefined
  }
  if (usage.percent === 0 && usage.tokens === 0) return undefined

  const percent = Math.max(0, usage.percent)
  const tokens = Math.max(0, usage.tokens ?? 0)
  const pct = Math.min(999, Math.round(percent))
  return color(contextColor({ tokens, percent }), `${pct}% ${formatTokens(tokens)}`)
}

function contextColor({ tokens, percent }: { tokens: number; percent: number }): string {
  const green: [number, number] = [0, 180]
  const yellow: [number, number] = [220, 180]
  const orange: [number, number] = [220, 120]
  const red: [number, number] = [220, 60]

  if (percent >= 80) {
    return gradientColor({ from: orange, to: red, progress: (percent - 80) / 10 })
  }

  const yellowPercent = tokens > 0 ? (150000 * percent) / tokens : 80
  // Small context windows reach percentage warnings before the absolute token anchor.
  if (yellowPercent >= 80) {
    return gradientColor({ from: green, to: orange, progress: percent / 80 })
  }
  if (tokens <= 150000) {
    return gradientColor({ from: green, to: yellow, progress: tokens / 150000 })
  }
  return gradientColor({
    from: yellow,
    to: orange,
    progress: (percent - yellowPercent) / (80 - yellowPercent),
  })
}

function gradientColor({ from, to, progress }: {
  from: [number, number]
  to: [number, number]
  progress: number
}): string {
  const fraction = Math.max(0, Math.min(1, progress))
  const r = Math.round(from[0] + (to[0] - from[0]) * fraction)
  const g = Math.round(from[1] + (to[1] - from[1]) * fraction)
  return `\x1b[38;2;${r};${g};0m`
}

type SessionMetrics = {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
  cost: number
  durationMs: number
}

function sessionMetrics(ctx: any): SessionMetrics {
  const metrics: SessionMetrics = {
    input: 0,
    output: 0,
    cacheRead: 0,
    cacheWrite: 0,
    cost: 0,
    durationMs: 0,
  }

  for (const entry of ctx.sessionManager.getEntries()) {
    if (entry.type !== 'message' || entry.message.role !== 'assistant') continue
    const message = entry.message as AssistantMessage & {
      usage?: any
      durationMs?: number
      duration?: number
    }
    metrics.input += Number(message.usage?.input ?? 0)
    metrics.output += Number(message.usage?.output ?? 0)
    metrics.cacheRead += Number(message.usage?.cacheRead ?? 0)
    metrics.cacheWrite += Number(message.usage?.cacheWrite ?? 0)
    metrics.cost += Number(
      message.usage?.cost?.total ?? message.usage?.cost?.usd ?? message.usage?.cost ?? 0,
    )
    metrics.durationMs += Number(message.durationMs ?? message.duration ?? 0)
  }

  return metrics
}

function formatDuration(ms: number): string | undefined {
  if (!ms) return undefined
  const total = Math.floor(ms / 1000)
  if (total >= 60) return `${Math.floor(total / 60)}m${total % 60}s`
  return `${total}s`
}

function kebabCase(text: string): string {
  return text
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function modelSegment(pi: ExtensionAPI, ctx: any): string | undefined {
  const modelName = ctx.model?.name ?? ctx.model?.id
  if (!modelName) return undefined

  const formattedModelName = kebabCase(modelName)
  if (!ctx.model?.reasoning) return formattedModelName

  try {
    const level = pi.getThinkingLevel()
    return level === 'off' ? `${formattedModelName} thinking-off` : `${formattedModelName} ${level}`
  } catch {
    return formattedModelName
  }
}

function sanitizeStatusText(text: string): string {
  return text
    .replace(/[\r\n\t]/g, ' ')
    .replace(/ +/g, ' ')
    .trim()
}

export default function (pi: ExtensionAPI) {
  pi.on('session_start', async (_event, ctx) => {
    ctx.ui.setFooter((tui, _theme, footerData) => {
      let disposed = false
      let refreshInFlight = false
      let cache: GitCache = {
        directory: `${FOLDER_ICON} ${formatDirectoryFromRoot(ctx.cwd, undefined)}`,
        gitSegments: [],
      }

      const refresh = async () => {
        if (disposed || refreshInFlight) return
        refreshInFlight = true
        try {
          cache = await refreshGitCache(ctx.cwd)
          tui.requestRender()
        } catch {
          // Keep the last known-good statusline. Rendering must never depend on git succeeding.
        } finally {
          refreshInFlight = false
        }
      }

      void refresh()
      const timer = setInterval(() => void refresh(), GIT_REFRESH_MS)
      timer.unref?.()

      const unsubBranch = footerData.onBranchChange(() => {
        void refresh()
        tui.requestRender()
      })

      return {
        dispose() {
          disposed = true
          clearInterval(timer)
          unsubBranch()
        },
        invalidate() {},
        render(width: number): string[] {
          const sessionName = ctx.sessionManager.getSessionName?.()
          const segments = [color(BLUE, cache.directory), ...cache.gitSegments]

          const stats = sessionMetrics(ctx)
          const model = modelSegment(pi, ctx)
          if (model) segments.push(color(MAGENTA, model))

          const ctxSegment = contextSegment(ctx.getContextUsage())
          if (ctxSegment) segments.push(ctxSegment)

          if (stats.cost > 0) {
            const duration = formatDuration(stats.durationMs)
            segments.push(color(GREY, `$${stats.cost.toFixed(2)}${duration ? ` ${duration}` : ''}`))
          }

          const sep = ` ${DIM}·${RESET} `
          const line = segments.join(sep)
          const padding = Math.max(0, width - visibleWidth(line))
          const lines = [truncateToWidth(line + ' '.repeat(padding), width, '')]
          if (sessionName) {
            lines.push(truncateToWidth(color(GREY, sessionName), width, color(GREY, '...')))
          }

          // Remove the "rewind" extension status from the status line
          const extensionStatuses = Array.from(footerData.getExtensionStatuses().entries())
            .filter(([key]) => key !== 'rewind')
            .sort(([a], [b]) => a.localeCompare(b))

          if (extensionStatuses.length > 0) {
            const statusLine = extensionStatuses
              .map(([, text]) => sanitizeStatusText(text))
              .join(' ')
            lines.push(truncateToWidth(statusLine, width, color(GREY, '...')))
          }

          return lines
        },
      }
    })
  })
}
