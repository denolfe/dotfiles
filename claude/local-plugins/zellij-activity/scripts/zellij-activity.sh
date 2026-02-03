#!/bin/bash
# Displays Claude Code activity status in Zellij tab name
#
# Required ~/.claude/settings.json hooks configuration:
#
#   "hooks": {
#     "SessionStart": { "hooks": [{ "type": "command", "command": ["~/.claude/hooks/zellij-activity.sh"] }],
#     "PreToolUse": { "hooks": [{ "type": "command", "command": ["~/.claude/hooks/zellij-activity.sh"] }],
#     "PermissionRequest": { "hooks": [{ "type": "command", "command": ["~/.claude/hooks/zellij-activity.sh"] }],
#     "Stop": { "hooks": [{ "type": "command", "command": ["~/.claude/hooks/zellij-activity.sh"] }],
#     "SessionEnd": { "hooks": [{ "type": "command", "command": ["~/.claude/hooks/zellij-activity.sh"] }],
#     "UserPromptSubmit": { "hooks": [{ "type": "command", "command": ["~/.claude/hooks/zellij-activity.sh"] }]
#   }

[[ -z "$ZELLIJ" ]] && exit 0

input=$(cat)

hook_type=$(echo "$input" | jq -r '.hook_event_name // empty')
cwd=$(echo "$input" | jq -r '.cwd // .session.cwd // empty')

state_file="/tmp/zellij-claude-tab-${ZELLIJ_PANE_ID}"

set_base_name() {
  local base_name=""

  if [[ -n "$cwd" ]]; then
    cd "$cwd" 2>/dev/null || return
    git_path=$(git rev-parse --git-dir 2>/dev/null)
    if [[ "$git_path" =~ \.git/worktrees/ ]]; then
      base_name=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    fi
  fi

  [[ -z "$base_name" || "$base_name" == "HEAD" ]] && base_name=$(basename "${cwd:-$PWD}")

  echo "$base_name" > "$state_file"
  echo "$base_name"
}

get_base_name() {
  if [[ -f "$state_file" ]]; then
    cat "$state_file"
  else
    set_base_name
  fi
}

rename_tab() {
  local name="$1"
  zellij action rename-tab "$name" 2>/dev/null
}

case "$hook_type" in
  SessionStart)
    base_name=$(set_base_name)
    rename_tab "$base_name"
    ;;
  PreToolUse)
    tool_name=$(echo "$input" | jq -r '.tool_name // empty')
    base_name=$(get_base_name)
    if [[ "$tool_name" == "AskUserQuestion" ]]; then
      rename_tab "❓ $base_name"
    else
      rename_tab "🔄 $base_name"
    fi
    ;;
  PermissionRequest)
    tool_name=$(echo "$input" | jq -r '.tool_name // empty')
    [[ "$tool_name" == "AskUserQuestion" ]] && exit 0
    base_name=$(get_base_name)
    rename_tab "🔴 $base_name"
    ;;
  UserPromptSubmit)
    base_name=$(get_base_name)
    rename_tab "$base_name"
    ;;
  Stop)
    base_name=$(get_base_name)
    rename_tab "🟢 $base_name"
    ;;
  SessionEnd)
    base_name=$(get_base_name)
    rename_tab "$base_name"
    rm -f "$state_file"
    ;;
esac
