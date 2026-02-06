/**
 * Claude Code Hook Type Definitions
 *
 * TypeScript types for building Claude Code hooks. Hooks are user-defined shell
 * commands or LLM prompts that execute at specific points in Claude Code's lifecycle.
 *
 * ## Hook Lifecycle (execution order)
 *
 * ```
 * SessionStart ──► UserPromptSubmit ──► [Agentic Loop] ──► Stop ──► SessionEnd
 *                                              │
 *                                              ▼
 *                        ┌─────────────────────────────────────────┐
 *                        │  PreToolUse ──► PermissionRequest       │
 *                        │       │                                 │
 *                        │       ▼                                 │
 *                        │  [Tool Executes]                        │
 *                        │       │                                 │
 *                        │       ├──► PostToolUse (success)        │
 *                        │       └──► PostToolUseFailure (error)   │
 *                        │                                         │
 *                        │  SubagentStart ──► SubagentStop         │
 *                        │  Notification, PreCompact               │
 *                        └─────────────────────────────────────────┘
 * ```
 *
 * ## Hook Events Summary
 *
 * | Event              | Fires When                          | Can Block? |
 * |--------------------|-------------------------------------|------------|
 * | SessionStart       | Session begins/resumes              | No         |
 * | UserPromptSubmit   | User submits prompt                 | Yes        |
 * | PreToolUse         | Before tool executes                | Yes        |
 * | PermissionRequest  | Permission dialog appears           | Yes        |
 * | PostToolUse        | After tool succeeds                 | No*        |
 * | PostToolUseFailure | After tool fails                    | No         |
 * | SubagentStart      | Subagent spawned                    | No         |
 * | SubagentStop       | Subagent finishes                   | Yes        |
 * | Stop               | Claude finishes responding          | Yes        |
 * | Notification       | System notification sent            | No         |
 * | PreCompact         | Before context compaction           | No         |
 * | SessionEnd         | Session terminates                  | No         |
 * | Setup              | Repository init/maintenance         | No         |
 *
 * *PostToolUse can provide feedback to Claude but cannot undo the tool execution.
 *
 * ## Usage
 *
 * ```ts
 * import type { BashToolInput, PreToolUseHandler } from './types'
 * import { runHook } from './utils'
 *
 * const handler: PreToolUseHandler<BashToolInput> = data => {
 *   // Return void to allow, or { hookSpecificOutput: { permissionDecision, ... } }
 * }
 *
 * runHook(handler) // Handles stdin parsing and stdout serialization
 * ```
 *
 * @example See `local-plugins/git-guardrails/scripts/git-guardrails.ts`
 *
 * ## Exit Codes
 *
 * - Exit 0: Success. Claude Code parses stdout for JSON output.
 * - Exit 2: Blocking error. stderr fed to Claude, action blocked (if blockable).
 * - Other: Non-blocking error. stderr shown in verbose mode, execution continues.
 *
 * @see https://code.claude.com/docs/en/hooks - Hook reference documentation
 * @see https://code.claude.com/docs/en/hooks-guide - Getting started guide
 * @see https://www.schemastore.org/claude-code-settings.json - Settings schema
 *
 * Based on https://gist.github.com/FrancisBourre/50dca37124ecc43eaf08328cdcccdb34
 */

/**
 * All available hook event types in Claude Code
 */
export type HookEventName =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'PostToolUseFailure'
  | 'PermissionRequest'
  | 'UserPromptSubmit'
  | 'SessionStart'
  | 'SessionEnd'
  | 'Setup'
  | 'Stop'
  | 'SubagentStart'
  | 'SubagentStop'
  | 'Notification'
  | 'PreCompact'

/**
 * Base output interface with common fields across all hook outputs
 *
 * @property continue - If false, stops further hook processing
 * @property suppressOutput - If true, suppresses output to user
 * @property stopReason - Reason for stopping (if continue is false)
 */
export interface BaseHookOutput {
  continue?: boolean
  suppressOutput?: boolean
  stopReason?: string
  systemMessage?: string
}

/**
 * Output interface for hooks that can block/allow actions
 *
 * @extends BaseHookOutput
 * @property decision - 'block' to prevent action, null to allow
 * @property reason - Explanation shown to Claude or user when blocking
 */
export interface BlockableHookOutput extends BaseHookOutput {
  decision?: 'block' | null
  reason?: string
}

/**
 * Generic hook input with event name constraint
 *
 * @template TEventName - Specific hook event name for type safety
 * @property session_id - Unique session identifier
 * @property transcript_path - Path to conversation transcript
 * @property cwd - Current working directory
 * @property hook_event_name - The specific hook event being triggered
 */
/**
 * Permission modes available in Claude Code
 */
export type PermissionMode = 'default' | 'plan' | 'acceptEdits' | 'dontAsk' | 'bypassPermissions'

/**
 * Generic hook input with event name constraint
 *
 * @template TEventName - Specific hook event name for type safety
 * @property session_id - Unique session identifier
 * @property transcript_path - Path to conversation transcript
 * @property cwd - Current working directory
 * @property permission_mode - Current permission mode
 * @property hook_event_name - The specific hook event being triggered
 */
export interface HookInput<TEventName extends HookEventName = HookEventName> {
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: PermissionMode
  hook_event_name: TEventName
}

/**
 * Input for PreToolUse hook - runs before tool execution
 *
 * Allows blocking or modifying tool calls before they execute.
 *
 * @template TToolInput - Specific tool input type for type safety
 * @property tool_name - Name of the tool about to be executed
 * @property tool_input - Parameters being passed to the tool
 * @see https://code.claude.com/docs/en/hooks#pretooluse
 */
export interface PreToolUseInput<
  TToolInput = Record<string, unknown>,
> extends HookInput<'PreToolUse'> {
  tool_name: string
  tool_input: TToolInput
  tool_use_id: string
}

/**
 * Output for PreToolUse hook
 *
 * @property hookSpecificOutput.permissionDecision - 'allow' bypasses permissions, 'deny' blocks, 'ask' prompts user
 * @property hookSpecificOutput.permissionDecisionReason - Explanation shown to Claude or user
 * @property hookSpecificOutput.updatedInput - Modified tool parameters (only when allowing)
 * @see https://code.claude.com/docs/en/hooks#pretooluse
 */
export interface PreToolUseOutput extends BaseHookOutput {
  hookSpecificOutput?: {
    hookEventName: 'PreToolUse'
    permissionDecision: 'allow' | 'deny' | 'ask'
    permissionDecisionReason?: string
    updatedInput?: Record<string, unknown>
    additionalContext?: string
  }
}

/**
 * Input for PostToolUse hook - runs after tool execution
 *
 * Validates tool results and can block further processing based on output.
 *
 * @property tool_name - Name of the tool that was executed
 * @property tool_input - Parameters that were passed to the tool
 * @property tool_response - Result returned by the tool
 * @see https://code.claude.com/docs/en/hooks#posttooluse
 */
export interface PostToolUseInput extends HookInput<'PostToolUse'> {
  tool_name: string
  tool_input: Record<string, unknown>
  tool_response: Record<string, unknown>
  tool_use_id: string
}

/**
 * Output for PostToolUse hook
 *
 * @property hookSpecificOutput.additionalContext - Additional context for Claude
 * @property hookSpecificOutput.updatedMCPToolOutput - For MCP tools, replaces tool output
 * @see https://code.claude.com/docs/en/hooks#posttooluse
 */
export interface PostToolUseOutput extends BlockableHookOutput {
  hookSpecificOutput?: {
    hookEventName: 'PostToolUse'
    additionalContext?: string
    updatedMCPToolOutput?: unknown
  }
}

/**
 * Input for PostToolUseFailure hook - runs after a tool fails
 *
 * Allows handling or logging tool failures.
 *
 * @property tool_name - Name of the tool that failed
 * @property tool_input - Parameters that were passed to the tool
 * @property tool_use_id - Unique identifier for the tool call
 * @property error - Error message describing what went wrong
 * @property is_interrupt - Whether the failure was caused by user interruption
 * @see https://code.claude.com/docs/en/hooks#posttoolusefailure
 */
export interface PostToolUseFailureInput extends HookInput<'PostToolUseFailure'> {
  tool_name: string
  tool_input: Record<string, unknown>
  tool_use_id: string
  error: string
  is_interrupt?: boolean
}

/**
 * Output for PostToolUseFailure hook
 *
 * @property hookSpecificOutput.additionalContext - Additional context about the failure for Claude
 * @see https://code.claude.com/docs/en/hooks#posttoolusefailure
 */
export interface PostToolUseFailureOutput extends BaseHookOutput {
  hookSpecificOutput?: {
    hookEventName: 'PostToolUseFailure'
    additionalContext?: string
  }
}

/**
 * Permission suggestion shown in the permission dialog
 */
export interface PermissionSuggestion {
  type: string
  tool?: string
  [key: string]: unknown
}

/**
 * Input for PermissionRequest hook - triggers when permission dialogs appear
 *
 * Allows auto-approving or denying permission requests.
 *
 * @property tool_name - Name of the tool requesting permission
 * @property tool_input - Parameters for the tool requesting permission
 * @property permission_suggestions - "Always allow" options user would see in dialog
 * @see https://code.claude.com/docs/en/hooks#permissionrequest
 */
export interface PermissionRequestInput extends HookInput<'PermissionRequest'> {
  tool_name: string
  tool_input: Record<string, unknown>
  permission_suggestions?: PermissionSuggestion[]
}

/**
 * Decision for allowing a permission request
 */
export interface PermissionRequestAllowDecision {
  behavior: 'allow'
  /** Modified tool input parameters */
  updatedInput?: Record<string, unknown>
  /** Permission rule updates (equivalent to "always allow" options) */
  updatedPermissions?: PermissionSuggestion[]
}

/**
 * Decision for denying a permission request
 */
export interface PermissionRequestDenyDecision {
  behavior: 'deny'
  /** Message telling Claude why permission was denied */
  message?: string
  /** If true, stops Claude */
  interrupt?: boolean
}

/**
 * Output for PermissionRequest hook
 *
 * @property hookSpecificOutput.decision - Allow or deny decision with associated options
 * @see https://code.claude.com/docs/en/hooks#permissionrequest
 */
export interface PermissionRequestOutput extends BaseHookOutput {
  hookSpecificOutput?: {
    hookEventName: 'PermissionRequest'
    decision: PermissionRequestAllowDecision | PermissionRequestDenyDecision
  }
}

/**
 * Input for UserPromptSubmit hook - runs before processing user input
 *
 * Can block prompts, inject additional context, or validate user input.
 *
 * @property prompt - The user's submitted prompt text
 * @see https://code.claude.com/docs/en/hooks#userpromptsubmit
 */
export interface UserPromptSubmitInput extends HookInput<'UserPromptSubmit'> {
  prompt: string
}

/**
 * Output for UserPromptSubmit hook
 *
 * @property hookSpecificOutput.additionalContext - Context injected into conversation
 * @see https://code.claude.com/docs/en/hooks#userpromptsubmit
 */
export interface UserPromptSubmitOutput extends BlockableHookOutput {
  hookSpecificOutput?: {
    hookEventName: 'UserPromptSubmit'
    additionalContext: string
  }
}

/**
 * Input for SessionStart hook - runs when session starts or resumes
 *
 * Inject context at session start, initialize state, or perform setup tasks.
 *
 * @property source - How the session started
 * @property model - The model identifier being used
 * @property agent_type - Agent name if started with --agent flag
 * @see https://code.claude.com/docs/en/hooks#sessionstart
 */
export interface SessionStartInput extends HookInput<'SessionStart'> {
  source: 'startup' | 'resume' | 'clear' | 'compact'
  model: string
  agent_type?: string
}

/**
 * Output for SessionStart hook
 *
 * @property hookSpecificOutput.additionalContext - Context injected at session start
 * @see https://code.claude.com/docs/en/hooks#sessionstart
 */
export interface SessionStartOutput extends BaseHookOutput {
  hookSpecificOutput?: {
    hookEventName: 'SessionStart'
    additionalContext: string
  }
}

/**
 * Reasons why a session ended
 */
export type SessionEndReason =
  | 'clear'
  | 'logout'
  | 'prompt_input_exit'
  | 'bypass_permissions_disabled'
  | 'other'

/**
 * Input for SessionEnd hook - runs when session concludes
 *
 * Perform cleanup or logging when a session ends.
 *
 * @property reason - Why the session ended
 * @see https://code.claude.com/docs/en/hooks#sessionend
 */
export interface SessionEndInput extends HookInput<'SessionEnd'> {
  reason: SessionEndReason
}

/**
 * Output for SessionEnd hook
 *
 * @see https://code.claude.com/docs/en/hooks#sessionend
 */
export interface SessionEndOutput extends BaseHookOutput {}

/**
 * Input for Setup hook - runs during repository initialization or maintenance
 *
 * Perform setup tasks when initializing or maintaining a repository.
 *
 * Note: This hook is defined in the settings schema but not yet documented
 * in the official hooks reference.
 */
export interface SetupInput extends HookInput<'Setup'> {}

/**
 * Output for Setup hook
 *
 * Note: This hook is defined in the settings schema but not yet documented
 * in the official hooks reference.
 */
export interface SetupOutput extends BaseHookOutput {}

/**
 * Input for Stop hook - decides whether Claude should continue working
 *
 * Controls when Claude stops processing after completing a task.
 *
 * @property stop_hook_active - Whether the stop hook is currently active
 * @see https://code.claude.com/docs/en/hooks#stop
 */
export interface StopInput extends HookInput<'Stop'> {
  stop_hook_active: boolean
}

/**
 * Output for Stop hook
 *
 * Return 'block' decision to prevent Claude from stopping (continue working).
 *
 * @see https://code.claude.com/docs/en/hooks#stop
 */
export interface StopOutput extends BlockableHookOutput {}

/**
 * Input for SubagentStart hook - runs when a subagent is spawned
 *
 * Allows injecting context into subagent execution.
 *
 * @property agent_id - Unique identifier for the subagent
 * @property agent_type - Type of agent (Bash, Explore, Plan, or custom agent name)
 * @see https://code.claude.com/docs/en/hooks#subagentstart
 */
export interface SubagentStartInput extends HookInput<'SubagentStart'> {
  agent_id: string
  agent_type: string
}

/**
 * Output for SubagentStart hook
 *
 * @property hookSpecificOutput.additionalContext - Context injected into the subagent
 * @see https://code.claude.com/docs/en/hooks#subagentstart
 */
export interface SubagentStartOutput extends BaseHookOutput {
  hookSpecificOutput?: {
    hookEventName: 'SubagentStart'
    additionalContext?: string
  }
}

/**
 * Input for SubagentStop hook - decides whether subagent should continue
 *
 * Similar to Stop hook but for subagent execution control.
 *
 * @property stop_hook_active - Whether the stop hook is currently active
 * @property agent_id - Unique identifier for the subagent
 * @property agent_type - Type of agent (used for matcher filtering)
 * @property agent_transcript_path - Path to the subagent's transcript
 * @see https://code.claude.com/docs/en/hooks#subagentstop
 */
export interface SubagentStopInput extends HookInput<'SubagentStop'> {
  stop_hook_active: boolean
  agent_id: string
  agent_type: string
  agent_transcript_path: string
}

/**
 * Output for SubagentStop hook
 *
 * @see https://code.claude.com/docs/en/hooks#subagentstop
 */
export type SubagentStopOutput = StopOutput

/**
 * Notification types that can trigger notification hooks
 */
export type NotificationType =
  | 'permission_prompt'
  | 'idle_prompt'
  | 'auth_success'
  | 'elicitation_dialog'

/**
 * Input for Notification hook - responds to system notifications
 *
 * Customize notification behavior when Claude awaits user input.
 *
 * @property message - The notification message text
 * @property title - Optional notification title
 * @property notification_type - Type of notification that fired
 * @see https://code.claude.com/docs/en/hooks#notification
 */
export interface NotificationInput extends HookInput<'Notification'> {
  message: string
  title?: string
  notification_type: NotificationType
}

/**
 * Output for Notification hook
 *
 * @property hookSpecificOutput.additionalContext - Context added to the conversation
 * @see https://code.claude.com/docs/en/hooks#notification
 */
export interface NotificationOutput extends BaseHookOutput {
  hookSpecificOutput?: {
    hookEventName: 'Notification'
    additionalContext?: string
  }
}

/**
 * Input for PreCompact hook - runs before transcript compaction
 *
 * Perform actions before conversation history is compressed.
 *
 * @property trigger - Whether compaction was 'manual' or 'auto'
 * @property custom_instructions - Custom instructions for compaction
 * @see https://code.claude.com/docs/en/hooks#precompact
 */
export interface PreCompactInput extends HookInput<'PreCompact'> {
  trigger: 'manual' | 'auto'
  custom_instructions: string
}

/**
 * Output for PreCompact hook
 *
 * @see https://code.claude.com/docs/en/hooks#precompact
 */
export interface PreCompactOutput extends BaseHookOutput {}

/**
 * Handler function type for PreToolUse hooks
 *
 * Ensures input and output types match for PreToolUse hook implementations.
 *
 * @template TToolInput - Specific tool input type (default: any Record)
 * @param input - PreToolUse hook input with typed tool_input
 * @returns PreToolUseOutput or void (void = allow with no modifications)
 * @see https://code.claude.com/docs/en/hooks#pretooluse
 * @example
 * const handler: PreToolUseHandler<BashToolInput> = (input) => {
 *   const { command } = input.tool_input
 *   if (shouldBlock(command)) {
 *     return {
 *       hookSpecificOutput: {
 *         hookEventName: 'PreToolUse',
 *         permissionDecision: 'deny',
 *         permissionDecisionReason: 'Reason here'
 *       }
 *     }
 *   }
 *   // void return = allow with no modifications
 * }
 */
export type PreToolUseHandler<TToolInput = Record<string, unknown>> = (
  input: PreToolUseInput<TToolInput>,
) => PreToolUseOutput | void

/**
 * Handler function type for WebFetch PreToolUse hooks
 *
 * @param input - PreToolUse hook input with WebFetch tool parameters
 * @returns PreToolUseOutput or void
 */
export type WebFetchPreToolUseHandler = PreToolUseHandler<WebFetchToolInput>

/**
 * Handler function type for PostToolUse hooks
 *
 * @param input - PostToolUse hook input
 * @returns PostToolUseOutput or void
 * @see https://code.claude.com/docs/en/hooks#posttooluse
 */
export type PostToolUseHandler = (input: PostToolUseInput) => PostToolUseOutput | void

/**
 * Handler function type for PostToolUseFailure hooks
 *
 * @param input - PostToolUseFailure hook input
 * @returns PostToolUseFailureOutput or void
 * @see https://code.claude.com/docs/en/hooks#posttoolusefailure
 */
export type PostToolUseFailureHandler = (
  input: PostToolUseFailureInput,
) => PostToolUseFailureOutput | void

/**
 * Handler function type for PermissionRequest hooks
 *
 * @param input - PermissionRequest hook input
 * @returns PermissionRequestOutput or void
 * @see https://code.claude.com/docs/en/hooks#permissionrequest
 */
export type PermissionRequestHandler = (
  input: PermissionRequestInput,
) => PermissionRequestOutput | void

/**
 * Handler function type for UserPromptSubmit hooks
 *
 * @param input - UserPromptSubmit hook input
 * @returns UserPromptSubmitOutput or void
 * @see https://code.claude.com/docs/en/hooks#userpromptsubmit
 */
export type UserPromptSubmitHandler = (
  input: UserPromptSubmitInput,
) => UserPromptSubmitOutput | void

/**
 * Handler function type for SessionStart hooks
 *
 * @param input - SessionStart hook input
 * @returns SessionStartOutput or void
 * @see https://code.claude.com/docs/en/hooks#sessionstart
 */
export type SessionStartHandler = (input: SessionStartInput) => SessionStartOutput | void

/**
 * Handler function type for SessionEnd hooks
 *
 * @param input - SessionEnd hook input
 * @returns SessionEndOutput or void
 * @see https://code.claude.com/docs/en/hooks#sessionend
 */
export type SessionEndHandler = (input: SessionEndInput) => SessionEndOutput | void

/**
 * Handler function type for Setup hooks
 *
 * @param input - Setup hook input
 * @returns SetupOutput or void
 * @see https://code.claude.com/docs/en/hooks#setup
 */
export type SetupHandler = (input: SetupInput) => SetupOutput | void

/**
 * Handler function type for Stop hooks
 *
 * @param input - Stop hook input
 * @returns StopOutput or void (void = allow stopping)
 * @see https://code.claude.com/docs/en/hooks#stop
 */
export type StopHandler = (input: StopInput) => StopOutput | void

/**
 * Handler function type for SubagentStart hooks
 *
 * @param input - SubagentStart hook input
 * @returns SubagentStartOutput or void
 * @see https://code.claude.com/docs/en/hooks#subagentstart
 */
export type SubagentStartHandler = (input: SubagentStartInput) => SubagentStartOutput | void

/**
 * Handler function type for SubagentStop hooks
 *
 * @param input - SubagentStop hook input
 * @returns StopOutput or void (void = allow stopping)
 * @see https://code.claude.com/docs/en/hooks#subagentstop
 */
export type SubagentStopHandler = (input: SubagentStopInput) => StopOutput | void

/**
 * Handler function type for Notification hooks
 *
 * @param input - Notification hook input
 * @returns NotificationOutput or void
 * @see https://code.claude.com/docs/en/hooks#notification
 */
export type NotificationHandler = (input: NotificationInput) => NotificationOutput | void

/**
 * Handler function type for PreCompact hooks
 *
 * @param input - PreCompact hook input
 * @returns PreCompactOutput or void
 * @see https://code.claude.com/docs/en/hooks#precompact
 */
export type PreCompactHandler = (input: PreCompactInput) => PreCompactOutput | void

/**
 * Input parameters for Bash tool
 *
 * Executes shell commands with optional timeout and background execution.
 *
 * @property command - Shell command to execute
 * @property description - Optional description of what command does (5-10 words)
 * @property timeout - Timeout in milliseconds (max 600000ms / 10 minutes)
 * @property run_in_background - If true, runs command in background
 */
export interface BashToolInput {
  command: string
  description?: string
  timeout?: number
  run_in_background?: boolean
}

/**
 * Input parameters for Write tool
 *
 * Creates or overwrites a file with specified content.
 *
 * @property file_path - Absolute path to file to write
 * @property content - Content to write to file
 */
export interface WriteToolInput {
  file_path: string
  content: string
}

/**
 * Input parameters for Edit tool
 *
 * Performs exact string replacement in files.
 *
 * @property file_path - Absolute path to file to modify
 * @property old_string - Exact text to find and replace
 * @property new_string - Replacement text
 * @property replace_all - If true, replaces all occurrences (default: false)
 */
export interface EditToolInput {
  file_path: string
  old_string: string
  new_string: string
  replace_all?: boolean
}

/**
 * Input parameters for Read tool
 *
 * Reads file contents with optional line range.
 *
 * @property file_path - Absolute path to file to read
 * @property offset - Line number to start reading from (1-indexed)
 * @property limit - Number of lines to read
 */
export interface ReadToolInput {
  file_path: string
  offset?: number
  limit?: number
}

/**
 * Input parameters for WebFetch tool
 *
 * Fetches content from URLs and processes with AI model.
 *
 * @property url - URL to fetch content from
 * @property prompt - Prompt describing what to extract from content
 */
export interface WebFetchToolInput {
  url: string
  prompt: string
}

/**
 * Union of all tool input types
 *
 * Note: Future enhancement could add discriminator field for type narrowing
 */
export type ToolInput =
  | BashToolInput
  | WriteToolInput
  | EditToolInput
  | ReadToolInput
  | WebFetchToolInput
