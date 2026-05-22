#!/bin/bash
# Displays Claude Code activity status in tmux window name

[[ -z "$TMUX" ]] && exit 0

input=$(cat)

hook_type=$(echo "$input" | jq -r '.hook_event_name // empty')
cwd=$(echo "$input" | jq -r '.cwd // .session.cwd // empty')

state_file="/tmp/tmux-claude-window-${TMUX_PANE}"

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

rename_window() {
  local name="$1"
  tmux rename-window -t "$TMUX_PANE" "$name" 2>/dev/null
}

get_tool_icon() {
  case "$1" in
    Bash)            echo "🖥️" ;;
    Read)            echo "📖" ;;
    Edit)            echo "✏️" ;;
    Write)           echo "💾" ;;
    Grep)            echo "🔍" ;;
    Glob)            echo "📂" ;;
    Task|Agent)      echo "🤖" ;;
    WebFetch)        echo "🌐" ;;
    WebSearch)       echo "🔎" ;;
    AskUserQuestion) echo "❓" ;;
    *)               echo "🔄" ;;
  esac
}

case "$hook_type" in
  SessionStart)
    base_name=$(set_base_name)
    rename_window "$base_name"
    ;;
  PreToolUse)
    tool_name=$(echo "$input" | jq -r '.tool_name // empty')
    base_name=$(get_base_name)
    icon=$(get_tool_icon "$tool_name")
    rename_window "$icon $base_name"
    ;;
  PermissionRequest)
    tool_name=$(echo "$input" | jq -r '.tool_name // empty')
    [[ "$tool_name" == "AskUserQuestion" ]] && exit 0
    base_name=$(get_base_name)
    rename_window "🔴 $base_name"
    ;;
  UserPromptSubmit)
    base_name=$(get_base_name)
    rename_window "🔄 $base_name"
    ;;
  Stop)
    base_name=$(get_base_name)
    rename_window "🟢 $base_name"
    ;;
  SessionEnd)
    base_name=$(get_base_name)
    rename_window "$base_name"
    rm -f "$state_file"
    ;;
esac
