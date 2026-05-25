import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent'

const TMUX = process.env.TMUX
const TMUX_PANE = process.env.TMUX_PANE
const STATE_FILE = join(tmpdir(), `tmux-pi-window-${TMUX_PANE ?? process.pid}`)

function inTmux(): boolean {
  return Boolean(TMUX)
}

function exec(command: string, args: string[], cwd?: string): string | undefined {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
    }).trim()
  } catch {
    return undefined
  }
}

function git(cwd: string, args: string[]): string | undefined {
  return exec('git', args, cwd)
}

function computeBaseName(cwd: string): string {
  let baseName = ''
  const gitDir = git(cwd, ['rev-parse', '--git-dir'])

  if (gitDir?.includes('.git/worktrees/')) {
    baseName = git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']) ?? ''
  }

  if (!baseName || baseName === 'HEAD') baseName = basename(cwd)
  return baseName
}

function setBaseName(cwd: string): string {
  const baseName = computeBaseName(cwd)
  writeFileSync(STATE_FILE, baseName)
  return baseName
}

function getBaseName(cwd: string): string {
  if (existsSync(STATE_FILE)) return readFileSync(STATE_FILE, 'utf8').trim()
  return setBaseName(cwd)
}

function renameWindow(name: string): void {
  if (!inTmux()) return
  const args = TMUX_PANE ? ['rename-window', '-t', TMUX_PANE, name] : ['rename-window', name]
  try {
    execFileSync('tmux', args, { stdio: 'ignore' })
  } catch {
    // Ignore failures outside attached tmux clients or with unsupported targets.
  }
}

function toolIcon(toolName: string): string {
  switch (toolName.toLowerCase()) {
    case 'bash':
      return '🖥️'
    case 'read':
      return '📖'
    case 'edit':
      return '✏️'
    case 'write':
      return '💾'
    case 'grep':
      return '🔍'
    case 'glob':
    case 'find':
    case 'ls':
      return '📂'
    case 'task':
    case 'agent':
      return '🤖'
    case 'webfetch':
    case 'web_fetch':
      return '🌐'
    case 'websearch':
    case 'web_search':
      return '🔎'
    case 'askuserquestion':
    case 'ask_user_question':
      return '❓'
    default:
      return '🔄'
  }
}

export default function (pi: ExtensionAPI) {
  if (!inTmux()) return

  pi.on('session_start', (_event, ctx) => {
    renameWindow(setBaseName(ctx.cwd))
  })

  pi.on('input', (_event, ctx) => {
    renameWindow(`🔄 ${getBaseName(ctx.cwd)}`)
  })

  pi.on('tool_call', (event, ctx) => {
    renameWindow(`${toolIcon(event.toolName)} ${getBaseName(ctx.cwd)}`)
  })

  pi.on('agent_end', (_event, ctx) => {
    renameWindow(`🟢 ${getBaseName(ctx.cwd)}`)
  })

  pi.on('session_shutdown', (_event, ctx) => {
    renameWindow(getBaseName(ctx.cwd))
    rmSync(STATE_FILE, { force: true })
  })
}
