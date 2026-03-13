/**
 * Minimal Claude Code hook types for the auto-approve plugin.
 *
 * Subset of the canonical types in git-guardrails/scripts/types.ts,
 * copied here so the plugin is self-contained.
 *
 * @see https://code.claude.com/docs/en/hooks
 */

type HookEventName = 'PreToolUse'

type PermissionMode = 'default' | 'plan' | 'acceptEdits' | 'dontAsk' | 'bypassPermissions'

interface BaseHookOutput {
  continue?: boolean
  suppressOutput?: boolean
  stopReason?: string
  systemMessage?: string
}

interface HookInput<TEventName extends HookEventName = HookEventName> {
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: PermissionMode
  hook_event_name: TEventName
}

export interface PreToolUseInput<TToolInput = Record<string, unknown>> extends HookInput<'PreToolUse'> {
  tool_name: string
  tool_input: TToolInput
  tool_use_id: string
}

export interface PreToolUseOutput extends BaseHookOutput {
  hookSpecificOutput?: {
    hookEventName: 'PreToolUse'
    permissionDecision: 'allow' | 'deny' | 'ask'
    permissionDecisionReason?: string
    updatedInput?: Record<string, unknown>
    additionalContext?: string
  }
}

export type PreToolUseHandler<TToolInput = Record<string, unknown>> = (
  input: PreToolUseInput<TToolInput>,
) => PreToolUseOutput | void

export interface BashToolInput {
  command: string
  description?: string
  timeout?: number
  run_in_background?: boolean
}
