#!/usr/bin/env bun

/**
 * Claude Code PreToolUse Hook - Git Guardrails
 *
 * Enforces git workflow preferences by intercepting git commands before execution.
 *
 * What it does:
 *   1. Blocks `git add -A` and `git add --all` commands
 *      - Encourages targeted file additions for more intentional commits
 *      - Returns deny decision with helpful error message
 *
 *   2. Strips Claude attribution from git commit messages
 *      - Removes lines containing "generated" (case-insensitive)
 *      - Removes lines containing "co-authored-by" (case-insensitive)
 *      - Allows commits to proceed with cleaned messages
 *
 * Configuration:
 *   - Configured in ~/.claude/settings.json as PreToolUse hook with Bash matcher
 *   - Receives tool input via stdin as JSON
 *   - Returns JSON response with permissionDecision
 *
 * Testing:
 *   Run: bun test git-guardrails.test.ts
 */

import type { PreToolUseInput, PreToolUseOutput, BashToolInput } from './types'

// Read JSON from stdin
const input = await Bun.stdin.text()
const data: PreToolUseInput<BashToolInput> = JSON.parse(input) // Bash matcher in settings.json
const { command } = data.tool_input

// Block git add -A or --all (anywhere in command)
if (/git\s+add\b.*(\s|^)(-A|--all)/.test(command)) {
  outputAndExit({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        "Use targeted 'git add <files>' instead of 'git add -A' or '--all' for more intentional commits.",
    },
  })
}

// Strip Claude attribution from commits
if (/git\s+commit/.test(command)) {
  const lines = command.split('\n')
  const filtered = lines.filter(line => !/generated/i.test(line) && !/co-authored-by/i.test(line))

  const cleaned = filtered
    .join('\n')
    .replace(/\n{3,}/g, '\n\n') // Collapse 3+ consecutive newlines to 2
    .replace(/\n+$/, '') // Remove trailing newlines

  if (cleaned !== command) {
    outputAndExit({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'allow',
        updatedInput: {
          command: cleaned,
        },
      },
    })
  }
}

process.exit(0)

function outputAndExit(output: PreToolUseOutput) {
  console.log(JSON.stringify(output))
  process.exit(0)
}
