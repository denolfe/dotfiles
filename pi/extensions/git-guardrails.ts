import type { ExtensionAPI } from '@earendil-works/pi-coding-agent'

type Decision =
  | { action: 'allow' }
  | { action: 'block'; reason: string }
  | { action: 'confirm'; reason: string }
  | { action: 'rewrite'; command: string }

const TARGETED_ADD_REASON =
  "Use targeted 'git add <files>' instead of 'git add -A', '--all', or '.' for more intentional commits."
const GIT_ROOT_REASON = 'Run git commands from repo root instead of using -C/--git-dir/--work-tree.'
const AMEND_REASON = 'Amending commit. Confirm you want to proceed with --amend?'
const NO_VERIFY_REASON =
  'Using --no-verify to bypass repository git hooks. Confirm you want to skip pre-commit checks?'
const PUSH_REASON = 'Pushing to remote. Confirm?'

export function evaluateGitCommand(command: string): Decision {
  // Block git add -A, --all, or . (anywhere in command)
  if (
    /git\s+add\b.*(\s|^)(-A|--all)/.test(command) ||
    /git\s+add\b(\s+\S+)*\s+\.(\s|$)/.test(command)
  ) {
    return { action: 'block', reason: TARGETED_ADD_REASON }
  }

  // Block git -C, --git-dir, --work-tree (run from repo root instead)
  if (/git\s+(-C|--git-dir|--work-tree)\b/.test(command)) {
    return { action: 'block', reason: GIT_ROOT_REASON }
  }

  // Prompt for approval on git commit --amend
  if (/git\s+commit/.test(command) && /--amend/.test(command)) {
    return { action: 'confirm', reason: AMEND_REASON }
  }

  // Prompt for approval on git commit --no-verify
  if (/git\s+commit/.test(command) && /--no-verify/.test(command)) {
    return { action: 'confirm', reason: NO_VERIFY_REASON }
  }

  // Prompt for approval on git push
  if (/git\s+push\b/.test(command)) {
    return { action: 'confirm', reason: PUSH_REASON }
  }

  // Rewrite $(cat <<'EOF'...) to git commit -F - <<'EOF' (avoids $() permission prompts).
  // Also strips Claude attribution from the embedded message.
  if (/git\s+commit/.test(command) && /\$\(cat\s+<</.test(command)) {
    const match = command.match(
      /^(.*?)(git\s+commit\b.*?)\s+-m\s+"?\$\(cat\s+<<'?(\w+)'?\n([\s\S]*?)\n\3\n\)"?$/,
    )
    if (match) {
      const [, cmdPrefix, gitCommit, delimiter, message] = match
      return {
        action: 'rewrite',
        command: `${cmdPrefix}${gitCommit} -F - <<'${delimiter}'\n${message}\n${delimiter}`,
      }
    }
  }

  return { action: 'allow' }
}

export default function (pi: ExtensionAPI) {
  pi.on('tool_call', async (event, ctx) => {
    if (event.toolName !== 'bash') return

    const input = event.input as { command?: unknown }
    if (typeof input.command !== 'string') return

    const decision = evaluateGitCommand(input.command)

    switch (decision.action) {
      case 'allow':
        return
      case 'rewrite':
        input.command = decision.command
        return
      case 'block':
        return { block: true, reason: decision.reason }
      case 'confirm': {
        if (!ctx.hasUI) return { block: true, reason: decision.reason }
        const ok = await ctx.ui.confirm('Git guardrails', decision.reason)
        if (!ok) return { block: true, reason: decision.reason }
        return
      }
    }
  })
}
