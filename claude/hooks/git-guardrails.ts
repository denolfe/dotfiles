#!/usr/bin/env bun

/**
 * Claude Code PreToolUse Hook - Git Guardrails
 *
 * Enforces git workflow preferences by intercepting git commands before execution.
 *
 * What it does:
 *   1. Blocks `git add -A`, `git add --all`, and `git add .` commands
 *      - Encourages targeted file additions for more intentional commits
 *      - Returns deny decision with helpful error message
 *
 *   2. Prompts for approval on `git commit --amend`
 *      - Requires explicit confirmation before amending commits
 *      - Returns ask decision to prompt user
 *
 *   3. Prompts for approval on `git commit --no-verify`
 *      - Requires explicit confirmation before bypassing repository git hooks
 *      - Returns ask decision to prompt user
 *
 * Configuration:
 *   - Configured in ~/.claude/settings.json as PreToolUse hook with Bash matcher
 *   - Receives tool input via stdin as JSON
 *   - Returns JSON response with permissionDecision
 *
 * Testing:
 *   Run: bun test git-guardrails.test.ts
 */

import type { BashToolInput, PreToolUseHandler } from './types'
import { runHook } from './utils'

/**
 * Main hook handler for git guardrails
 *
 * Enforces git workflow by blocking dangerous commands and cleaning commit messages.
 *
 * @param data - PreToolUse hook input with Bash tool parameters
 * @returns PreToolUseOutput to deny/allow/modify, or void to allow unchanged
 */
const handler: PreToolUseHandler<BashToolInput> = data => {
  const { command } = data.tool_input

  // Block git add -A, --all, or . (anywhere in command)
  if (
    /git\s+add\b.*(\s|^)(-A|--all)/.test(command) ||
    /git\s+add\b(\s+\S+)*\s+\.(\s|$)/.test(command)
  ) {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          "Use targeted 'git add <files>' instead of 'git add -A', '--all', or '.' for more intentional commits.",
      },
    }
  }

  // Prompt for approval on git commit --amend
  if (/git\s+commit/.test(command) && /--amend/.test(command)) {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: 'Amending commit. Confirm you want to proceed with --amend?',
      },
    }
  }

  // Prompt for approval on git commit --no-verify
  if (/git\s+commit/.test(command) && /--no-verify/.test(command)) {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason:
          'Using --no-verify to bypass repository git hooks. Confirm you want to skip pre-commit checks?',
      },
    }
  }
}

// Entry point
runHook(handler)
