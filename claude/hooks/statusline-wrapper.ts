#!/usr/bin/env bun

// Powerline formatting utilities
type Segment = { text: string; fg: number; bg: number }

const reset = '\x1b[0m'
const fg = (code: number) => `\x1b[38;5;${code}m`
const bg = (code: number) => `\x1b[48;5;${code}m`
const segmentSep = '\uE0B0' //  (chevron)
const roundedLeft = '\uE0B6' //
const rightGradient = '▓▒░'

function formatPowerline(segments: Segment[]): string {
  if (segments.length === 0 || !segments[0]) return ''

  let result = ''

  // Rounded left edge
  result += fg(segments[0].bg) + roundedLeft + reset

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (!seg) continue
    const nextSeg = segments[i + 1]

    // Segment content: bg=current segment color, fg=current segment text color
    result += bg(seg.bg) + fg(seg.fg) + seg.text

    // Separator between segments (not at the end)
    if (nextSeg) {
      // Between segments:
      // bg = next segment's background color (area behind separator)
      // fg = current segment's background color (the separator character itself)
      result += bg(nextSeg.bg) + fg(seg.bg) + segmentSep
    }
  }

  // Right gradient coming out of last segment (replaces final separator)
  result += reset + fg(segments[segments.length - 1]?.bg as number) + rightGradient + reset

  return result
}

// Segment colors (terminal 256 colors)
const colors = {
  dir: { fg: 0, bg: 4 }, // blue
  branch: { fg: 0, bg: 6 }, // lighter teal
  costs: { fg: 0, bg: 214 }, // orange
  rate: { fg: 0, bg: 4 }, // blue
  context: { fg: 0, bg: 2 }, // green
}

// ========== Data Extraction ==========

const input = await Bun.stdin.text()
const data = JSON.parse(input)
const cwd = data.cwd.replace(/^~/, process.env.HOME || '~')

// Get git branch
let branch = ''
try {
  const proc = Bun.spawn(['git', '-C', cwd, 'branch', '--show-current'], {
    stdout: 'pipe',
  })
  branch = (await new Response(proc.stdout).text()).trim()
} catch {
  // Not a git repo or error
}

// Call ccusage with the input
const ccusage = Bun.spawn(['bun', 'x', 'ccusage', 'statusline'], {
  stdin: 'pipe',
  stdout: 'pipe',
})

await ccusage.stdin.write(input)
await ccusage.stdin.end()

const output = await new Response(ccusage.stdout).text()

// Default: 🤖 Sonnet 4.5 | 💰 $0.00 session / $0.35 today / $0.59 block (3h 43m left) | 🔥 $0.69/hr | 🧠 N/A

// Parse and compact metrics
const parts = output.split('|').map(s => s.trim())
const costMatch = parts[1]?.match(/(💰[^|]+)/)
const contextMatch = parts[3]?.match(/(🧠[^|]+)/)

const costSection =
  costMatch?.[1]
    ?.replace(/\s+session/g, '')
    ?.replace(/\s*\/\s*\$[\d.]+\s+block[^|]*/, '')
    ?.replace(/(\$[\d.]+)\s+today/g, '📅 $1')
    ?.trim() || ''

// Extract just the percentage from context (e.g., "🧠 100k/200k (50%)" -> "🧠 50%")
const contextRaw = contextMatch?.[1]?.trim() || ''
const percentMatch = contextRaw.match(/(\d+(?:\.\d+)?%)/)
const contextSection = percentMatch ? `🧠 ${percentMatch[1]}` : contextRaw

const dirSection = data.cwd.replace(process.env.HOME || '', '~')
const branchSection = branch ? `  ${branch} ` : ''

// ========== Format Output ==========

const segments: Segment[] = [
  { text: ` ${dirSection} `, ...colors.dir },
  ...(branch ? [{ text: branchSection, ...colors.branch }] : []),
  { text: ` ${costSection} `, ...colors.costs },
  { text: ` ${contextSection} `, ...colors.context },
]

const result = formatPowerline(segments)
process.stdout.write(result)
