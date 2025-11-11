/**
 * Claude Code Hook Type Definitions
 *
 * Modified version of https://gist.github.com/FrancisBourre/50dca37124ecc43eaf08328cdcccdb34
 */

export interface HookInput {
  session_id: string
  transcript_path: string
  cwd: string
  hook_event_name: string
}

export interface PreToolUseInput<T = Record<string, unknown>> extends HookInput {
  hook_event_name: 'PreToolUse'
  tool_name: string
  tool_input: T
}

export interface PreToolUseOutput {
  continue?: boolean
  suppressOutput?: boolean
  stopReason?: string
  hookSpecificOutput?: {
    hookEventName: 'PreToolUse'
    permissionDecision: 'allow' | 'deny' | 'ask'
    permissionDecisionReason?: string
    updatedInput?: Record<string, unknown>
  }
}

export interface PostToolUseInput extends HookInput {
  hook_event_name: 'PostToolUse'
  tool_name: string
  tool_input: Record<string, unknown>
  tool_response: Record<string, unknown>
}

export interface PostToolUseOutput {
  continue?: boolean
  suppressOutput?: boolean
  decision?: 'block' | null
  reason?: string
}

export interface UserPromptSubmitInput extends HookInput {
  hook_event_name: 'UserPromptSubmit'
  prompt: string
}

export interface UserPromptSubmitOutput {
  continue?: boolean
  suppressOutput?: boolean
  decision?: 'block' | null
  reason?: string
  hookSpecificOutput?: {
    hookEventName: 'UserPromptSubmit'
    additionalContext: string
  }
}

export interface SessionStartInput extends HookInput {
  hook_event_name: 'SessionStart'
  source: 'startup' | 'resume' | 'clear'
}

export interface SessionStartOutput {
  continue?: boolean
  suppressOutput?: boolean
  hookSpecificOutput?: {
    hookEventName: 'SessionStart'
    additionalContext: string
  }
}

export interface StopInput extends HookInput {
  hook_event_name: 'Stop'
  stop_hook_active: boolean
}

export interface SubagentStopInput extends HookInput {
  hook_event_name: 'SubagentStop'
  stop_hook_active: boolean
}

export interface StopOutput {
  continue?: boolean
  suppressOutput?: boolean
  decision?: 'block' | null
  reason?: string
}

export interface NotificationInput extends HookInput {
  hook_event_name: 'Notification'
  message: string
}

export interface NotificationOutput {
  continue?: boolean
  suppressOutput?: boolean
}

export interface PreCompactInput extends HookInput {
  hook_event_name: 'PreCompact'
  trigger: 'manual' | 'auto'
  custom_instructions: string
}

export interface PreCompactOutput {
  continue?: boolean
  suppressOutput?: boolean
}

// Tool-specific input types
export interface BashToolInput {
  command: string
  description?: string
  timeout?: number
  run_in_background?: boolean
}

export interface WriteToolInput {
  file_path: string
  content: string
}

export interface EditToolInput {
  file_path: string
  old_string: string
  new_string: string
  replace_all?: boolean
}

export interface ReadToolInput {
  file_path: string
  offset?: number
  limit?: number
}
