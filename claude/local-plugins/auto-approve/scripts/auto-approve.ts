#!/usr/bin/env bun

import type { BashToolInput, PreToolUseHandler, PreToolUseOutput } from './types'
import { runHook } from './utils'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

// Shell builtins that are always safe (no filesystem side effects worth blocking)
export const SAFE_BUILTINS = new Set([
  'cd', 'echo', 'printf', 'test', '[', '[[', 'true', 'false',
  'export', 'unset', 'source', '.', 'eval',
  'read', 'set', 'shift', 'return', 'exit',
  'local', 'declare', 'typeset', 'readonly',
  'pushd', 'popd', 'dirs',
  'type', 'which', 'command', 'builtin', 'hash',
  'wait', 'jobs', 'fg', 'bg', 'kill',
  'trap', 'umask', 'ulimit',
  'alias', 'unalias',
  'getopts', 'let', 'exec',
])

// --- Public API (exported for unit testing) ---

export function extractBashPatterns(allow: string[]): string[] {
  return allow
    .filter(rule => rule.startsWith('Bash(') && rule.endsWith(')'))
    .map(rule => rule.slice(5, -1))
}

export function matchesPattern(command: string, patterns: string[]): boolean {
  const trimmed = command.trim()

  for (const pattern of patterns) {
    if (pattern.endsWith(':*')) {
      const prefix = pattern.slice(0, -2)
      if (trimmed === prefix || trimmed.startsWith(prefix + ' ')) {
        return true
      }
    } else {
      if (trimmed === pattern) {
        return true
      }
    }
  }

  return false
}

export function loadAllowPatterns(settingsPaths: string[]): string[] {
  const allPatterns: string[] = []

  for (const filePath of settingsPaths) {
    if (!existsSync(filePath)) continue

    try {
      const content = JSON.parse(readFileSync(filePath, 'utf-8'))
      const allow = content?.permissions?.allow
      if (!Array.isArray(allow)) continue

      allPatterns.push(...extractBashPatterns(allow))
    } catch {
      continue
    }
  }

  return [...new Set(allPatterns)]
}

export function splitCompoundCommand(command: string): string[] {
  // Protect heredocs — don't split inside <<'EOF'...EOF or <<EOF...EOF
  const heredocMatch = command.match(/<<-?'?(\w+)'?/)
  if (heredocMatch) {
    const delimiter = heredocMatch[1]
    const endPattern = new RegExp(`^${delimiter}$`, 'm')
    if (endPattern.test(command)) {
      return [command]
    }
  }

  // Protect quoted strings by replacing with placeholders
  const quotes: string[] = []
  const protected_ = command.replace(/"(?:[^"\\]|\\.)*"|'[^']*'/g, match => {
    quotes.push(match)
    return `__QUOTE_${quotes.length - 1}__`
  })

  // Split on compound operators and newlines
  const segments = protected_
    .split(/\s*(?:&&|\|\||[;|]|\n)\s*/)
    .map(seg => seg.trim())
    .filter(Boolean)

  // Restore quoted strings
  return segments.map(seg =>
    seg.replace(/__QUOTE_(\d+)__/g, (_, idx: string) => quotes[Number(idx)]!),
  )
}

export type SubstitutionResult = {
  outerCommand: string
  innerCommands: string[]
  hasBackticks: boolean
  hasNestedSubstitution: boolean
}

export function extractCommandSubstitutions(command: string): SubstitutionResult {
  // Check for backticks (outside single quotes)
  const withoutSingleQuotes = command.replace(/'[^']*'/g, '')
  if (/`/.test(withoutSingleQuotes)) {
    return { outerCommand: command, innerCommands: [], hasBackticks: true, hasNestedSubstitution: false }
  }

  // Protect single-quoted strings
  const singleQuotes: string[] = []
  const working = command.replace(/'[^']*'/g, match => {
    singleQuotes.push(match)
    return `__SQ_${singleQuotes.length - 1}__`
  })

  const innerCommands: string[] = []

  // Extract $(...) — find matching parens
  let result = ''
  let i = 0
  while (i < working.length) {
    if (working[i] === '$' && working[i + 1] === '(') {
      let depth = 1
      let j = i + 2
      while (j < working.length && depth > 0) {
        if (working[j] === '(') depth++
        else if (working[j] === ')') depth--
        j++
      }
      const inner = working.slice(i + 2, j - 1)

      // Check for nested $()
      if (/\$\(/.test(inner)) {
        return { outerCommand: command, innerCommands: [], hasBackticks: false, hasNestedSubstitution: true }
      }

      innerCommands.push(inner.trim())
      result += '__CMD_SUB__'
      i = j
    } else {
      result += working[i]
      i++
    }
  }

  // Restore single-quoted strings
  result = result.replace(/__SQ_(\d+)__/g, (_, idx: string) => singleQuotes[Number(idx)]!)

  return { outerCommand: result, innerCommands, hasBackticks: false, hasNestedSubstitution: false }
}

export function stripWrappers(command: string): string {
  let cmd = command.trim()

  let hasChanged = true
  while (hasChanged) {
    hasChanged = false

    // Strip time prefix
    if (/^time\s+/.test(cmd)) {
      cmd = cmd.replace(/^time\s+/, '')
      hasChanged = true
    }

    // Strip timeout N prefix
    if (/^timeout\s+\d+\s+/.test(cmd)) {
      cmd = cmd.replace(/^timeout\s+\d+\s+/, '')
      hasChanged = true
    }

    // Strip nice [-n N] prefix
    const niceReplaced = cmd.replace(/^nice\s+(-n\s+\d+\s+)?/, '')
    if (niceReplaced !== cmd) {
      cmd = niceReplaced
      hasChanged = true
    }

    // Strip env var assignments (only when followed by a command)
    const envVarMatch = cmd.match(/^([A-Z_][A-Z0-9_]*=[^\s]*\s+)+(.+)$/)
    if (envVarMatch) {
      cmd = envVarMatch[2]!
      hasChanged = true
    }
  }

  return cmd
}

// --- Private helpers ---

function getSettingsPaths(): string[] {
  const testDir = process.env.TEST_SETTINGS_DIR
  if (testDir) {
    return [join(testDir, 'settings.json')]
  }

  const home = process.env.HOME ?? ''
  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? ''
  const paths = [join(home, '.claude', 'settings.json')]

  if (projectDir) {
    paths.push(join(projectDir, '.claude', 'settings.json'))
    paths.push(join(projectDir, '.claude', 'settings.local.json'))
  }

  return paths
}

function needsDecomposition(command: string): boolean {
  const withoutQuotes = command.replace(/"(?:[^"\\]|\\.)*"|'[^']*'/g, '')
  // Compound operators or command substitution
  if (/&&|\|\||[;|]|\$\(/.test(withoutQuotes)) return true
  // Wrapper prefixes that need stripping
  if (/^(time|timeout|nice)\s/.test(command.trim())) return true
  if (/^[A-Z_][A-Z0-9_]*=/.test(command.trim())) return true
  return false
}

function isBuiltin(command: string): boolean {
  const firstWord = command.trim().split(/\s+/)[0]
  return firstWord !== undefined && SAFE_BUILTINS.has(firstWord)
}

function approveSegment(segment: string, patterns: string[]): boolean {
  if (isBuiltin(segment)) return true
  if (matchesPattern(segment, patterns)) return true

  const stripped = stripWrappers(segment)
  if (stripped !== segment) {
    if (isBuiltin(stripped)) return true
    if (matchesPattern(stripped, patterns)) return true
  }

  return false
}

// --- Handler ---

const handler: PreToolUseHandler<BashToolInput> = data => {
  const { command } = data.tool_input

  // Fast path: simple commands don't need decomposition
  if (!needsDecomposition(command)) return

  const patterns = loadAllowPatterns(getSettingsPaths())
  if (patterns.length === 0) return

  // Handle command substitutions first
  const subResult = extractCommandSubstitutions(command)
  if (subResult.hasBackticks || subResult.hasNestedSubstitution) return

  // Validate inner commands from substitutions
  for (const inner of subResult.innerCommands) {
    if (!approveSegment(inner, patterns)) return
  }

  // Split the (outer) command into segments
  const commandToSplit = subResult.innerCommands.length > 0 ? subResult.outerCommand : command
  const segments = splitCompoundCommand(commandToSplit)

  // All segments must match
  for (const segment of segments) {
    const matchable = segment.replace(/__CMD_SUB__/g, 'PLACEHOLDER')
    if (!approveSegment(matchable, patterns)) return
  }

  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'allow',
      permissionDecisionReason: 'All segments match allow patterns',
    },
  } satisfies PreToolUseOutput
}

// Entry point
if (import.meta.main) {
  runHook(handler)
}
