#!/usr/bin/env bun

/**
 * Claude Code PreToolUse Hook - Git Guardrails
 *
 * Enforces git workflow preferences by intercepting git commands before execution.
 *
 * What it does:
 *   - Blocks `git add -A`, `git add --all`, and `git add .` commands
 *     - Encourages targeted file additions for more intentional commits
 *     - Returns deny decision with helpful error message
 *
 *   - Blocks `git -C`, `--git-dir`, `--work-tree` commands
 *     - Avoids permission prompts by running from repo root instead
 *     - Returns deny decision with helpful error message
 *
 *   - Prompts for approval on `git commit --amend`
 *     - Requires explicit confirmation before amending commits
 *     - Returns ask decision to prompt user
 *
 *   - Prompts for approval on `git commit --no-verify`
 *     - Requires explicit confirmation before bypassing repository git hooks
 *     - Returns ask decision to prompt user
 *
 *   - Prompts for approval on `git push`
 *     - Requires explicit confirmation before pushing to remote
 *     - Returns ask decision to prompt user
 *
 *   - Rewrites $(cat <<'EOF'...) commit pattern to git commit -F - <<'EOF'
 *     - Avoids $() subshell which triggers extra permission prompts
 *     - Silently rewrites the command with allow + updatedInput
 *
 *   - Strips Claude attribution from git commit messages
 *     - Removes lines containing "generated" (case-insensitive)
 *     - Removes lines containing "co-authored-by" (case-insensitive)
 *     - Allows commits to proceed with cleaned messages
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

  // Block git -C, --git-dir, --work-tree (avoids permission prompts, run from repo root instead)
  if (/git\s+(-C|--git-dir|--work-tree)\b/.test(command)) {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: 'Run git commands from repo root instead of using -C/--git-dir/--work-tree.',
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

  // Prompt for approval on git push
  if (/git\s+push\b/.test(command)) {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: 'Pushing to remote. Confirm?',
      },
    }
  }

  // Rewrite $(cat <<'EOF'...) to git commit -F - <<'EOF' (avoids $() permission prompts).
  // Also strips Claude attribution from the embedded message so the strip block below
  // doesn't need to run on the rewritten form.
  if (/git\s+commit/.test(command) && /\$\(cat\s+<</.test(command)) {
    const match = command.match(
      /^(.*?)(git\s+commit\b.*?)\s+-m\s+"?\$\(cat\s+<<'?(\w+)'?\n([\s\S]*?)\n\3\n\)"?$/,
    )
    if (match) {
      const [, cmdPrefix, gitCommit, delimiter, message] = match
      const cleanedMessage = stripClaudeAttribution(message)
      return {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'allow',
          updatedInput: {
            command: `${cmdPrefix}${gitCommit} -F - <<'${delimiter}'\n${cleanedMessage}\n${delimiter}`,
          },
        },
      }
    }
  }

  // Strip Claude attribution from commits, caught Claude ignoring `includeCoAuthoredBy: false`
  if (/git\s+commit/.test(command)) {
    const cleaned = stripClaudeAttribution(command)

    if (cleaned === command) {
      return
    }

    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'allow',
        updatedInput: {
          command: cleaned,
        },
      },
    }
  }
}

function stripClaudeAttribution(text: string): string {
  return text
    .split('\n')
    .filter(line => !/generated/i.test(line) && !/co-authored-by/i.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n+$/, '')
}

// Entry point
runHook(handler)
