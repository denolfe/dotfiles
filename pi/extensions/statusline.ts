import type { AssistantMessage } from '@earendil-works/pi-ai'
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent'
import { truncateToWidth, visibleWidth } from '@earendil-works/pi-tui'
import { execFileSync } from 'node:child_process'
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
const TRACK = '\x1b[38;5;238m'
const DARK_CAP = '\x1b[38;2;40;40;40m'

const FOLDER_ICON = ''
const BRANCH_ICON = ''
const LEFT_CAP = ''
const RIGHT_CAP = ''

function color(code: string, text: string): string {
  return `${code}${text}${RESET}`
}

function git(cwd: string, args: string[]): string | undefined {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
    }).trim()
  } catch {
    return undefined
  }
}

function gitRoot(cwd: string): string | undefined {
  return git(cwd, ['rev-parse', '--show-toplevel'])
}

function formatDirectory(cwd: string): string {
  const root = gitRoot(cwd)
  if (root && (cwd === root || cwd.startsWith(`${root}/`))) {
    const rel = relative(root, cwd)
    return rel ? `${basename(root)}/${rel}` : basename(root)
  }

  const home = homedir()
  return cwd === home ? '~' : cwd.startsWith(`${home}/`) ? `~${cwd.slice(home.length)}` : cwd
}

function gitStatusSegment(cwd: string): string[] {
  if (!git(cwd, ['rev-parse', '--is-inside-work-tree'])) return []

  const segments: string[] = []
  const branch =
    git(cwd, ['branch', '--show-current']) || git(cwd, ['rev-parse', '--short', 'HEAD'])

  if (branch) {
    const prInfo = git(cwd, ['config', '--get', `branch.${branch}.github-pr-owner-number`])
    if (prInfo) {
      const prNumber = prInfo.split('#')[2]
      const cache = git(cwd, ['config', '--get', `branch.${branch}.github-pr-state-cache`])
      const prColor = cache?.split(':')[0] === 'MERGED' ? PURPLE : ORANGE
      if (prNumber) segments.push(color(prColor, `#${prNumber}`))
    }

    const status = git(cwd, ['status', '--porcelain']) ?? ''
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
    if (git(cwd, ['rev-parse', '--abbrev-ref', '@{upstream}'])) {
      const ahead = Number(git(cwd, ['rev-list', '--count', '@{upstream}..HEAD']) ?? 0)
      const behind = Number(git(cwd, ['rev-list', '--count', 'HEAD..@{upstream}']) ?? 0)
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

function heatmapColor(pos: number): string {
  let r: number
  let g: number
  if (pos < 5) {
    r = Math.floor((pos * 220) / 5)
    g = 180
  } else {
    r = 220
    g = Math.floor(180 - ((pos - 5) * 120) / 5)
  }
  return `\x1b[38;2;${r};${g};0m`
}

function heatmapColorPartial(pos: number, brightness: number): string {
  let r: number
  let g: number
  if (pos < 5) {
    r = Math.floor(((pos * 220) / 5) * (brightness / 100))
    g = Math.floor(180 * (brightness / 100))
  } else {
    r = Math.floor(220 * (brightness / 100))
    g = Math.floor((180 - ((pos - 5) * 120) / 5) * (brightness / 100))
  }
  return `\x1b[38;2;${r};${g};0m`
}

function formatTokens(count: number): string {
  if (count < 1000) return count.toString()
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`
  if (count < 1000000) return `${Math.round(count / 1000)}k`
  if (count < 10000000) return `${(count / 1000000).toFixed(1)}M`
  return `${Math.round(count / 1000000)}M`
}

function contextSegment(
  usage: { percent?: number | null; contextWindow?: number | null } | undefined,
  autoCompactEnabled: boolean,
): string | undefined {
  const contextWindow = Number(usage?.contextWindow ?? 0)
  const auto = autoCompactEnabled ? ' (auto)' : ''
  if (usage?.percent == null) {
    return contextWindow > 0 ? color(GREY, `?/${formatTokens(contextWindow)}${auto}`) : undefined
  }

  const pct = Math.max(0, Math.min(999, Math.round(usage.percent)))
  const steps = Math.min(40, Math.floor((pct * 40) / 100))
  const full = Math.floor(steps / 4)
  const partial = steps % 4
  const empty = 10 - full - (partial > 0 ? 1 : 0)

  let bar = ''
  let pos = 0
  for (let i = 0; i < full; i++) {
    bar += `${heatmapColor(pos)}█`
    pos++
  }
  if (partial > 0) {
    const dimPos = Math.max(0, pos - 1)
    bar +=
      partial === 1
        ? `${heatmapColorPartial(dimPos, 35)}░`
        : partial === 2
          ? `${heatmapColorPartial(dimPos, 55)}▒`
          : `${heatmapColorPartial(dimPos, 80)}▓`
  }

  const track = '░'.repeat(Math.max(0, empty))
  const left = full > 0 || partial > 0 ? `${heatmapColor(0)}${LEFT_CAP}` : `${TRACK}${LEFT_CAP}`
  const output =
    empty === 0 && partial === 0
      ? `${left}${bar}${heatmapColor(9)}${RIGHT_CAP}${RESET}`
      : `${left}${bar}${TRACK}${track}${DARK_CAP}${RIGHT_CAP}${RESET}`
  const lastPos = Math.max(0, full + (partial > 0 ? 1 : 0) - 1)

  const percentAndWindow = `${pct}%${contextWindow > 0 ? `/${formatTokens(contextWindow)}` : ''}${auto}`
  return `${output} ${heatmapColor(lastPos)}${percentAndWindow}${RESET}`
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

function autoCompactEnabled(ctx: any): boolean {
  return ctx.session?.autoCompactionEnabled !== false
}

function modelSegment(pi: ExtensionAPI, ctx: any): string | undefined {
  const modelName = ctx.model?.name ?? ctx.model?.id
  if (!modelName) return undefined

  if (!ctx.model?.reasoning) return modelName

  try {
    const level = pi.getThinkingLevel()
    return level === 'off' ? `${modelName} • thinking off` : `${modelName} • ${level}`
  } catch {
    return modelName
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
      const unsub = footerData.onBranchChange(() => tui.requestRender())

      return {
        dispose: unsub,
        invalidate() {},
        render(width: number): string[] {
          const sessionName = ctx.sessionManager.getSessionName?.()
          const directory = `${FOLDER_ICON} ${formatDirectory(ctx.cwd)}${sessionName ? ` • ${sessionName}` : ''}`
          const segments = [color(BLUE, directory), ...gitStatusSegment(ctx.cwd)]

          const stats = sessionMetrics(ctx)
          const tokenStats: string[] = []
          if (stats.input > 0) tokenStats.push(`↑${formatTokens(stats.input)}`)
          if (stats.output > 0) tokenStats.push(`↓${formatTokens(stats.output)}`)
          if (stats.cacheRead > 0) tokenStats.push(`R${formatTokens(stats.cacheRead)}`)
          if (stats.cacheWrite > 0) tokenStats.push(`W${formatTokens(stats.cacheWrite)}`)
          if (tokenStats.length) segments.push(color(GREY, tokenStats.join(' ')))

          const model = modelSegment(pi, ctx)
          if (model) segments.push(color(MAGENTA, model))

          const ctxSegment = contextSegment(ctx.getContextUsage(), autoCompactEnabled(ctx))
          if (ctxSegment) segments.push(ctxSegment)

          if (stats.cost > 0) {
            const duration = formatDuration(stats.durationMs)
            segments.push(color(GREY, `$${stats.cost.toFixed(2)}${duration ? ` ${duration}` : ''}`))
          }

          const sep = ` ${DIM}│${RESET} `
          const line = segments.join(sep)
          const padding = Math.max(0, width - visibleWidth(line))
          const lines = [truncateToWidth(line + ' '.repeat(padding), width, '')]

          const extensionStatuses = footerData.getExtensionStatuses()
          if (extensionStatuses.size > 0) {
            const statusLine = Array.from(extensionStatuses.entries())
              .sort(([a], [b]) => a.localeCompare(b))
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
