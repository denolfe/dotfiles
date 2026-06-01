#!/bin/bash
# Displays Claude Code activity status in tmux window name

[[ -z "$TMUX" ]] && exit 0

input=$(cat)

hook_type=$(echo "$input" | jq -r '.hook_event_name // empty')
cwd=$(echo "$input" | jq -r '.cwd // .session.cwd // empty')

state_file="/tmp/tmux-claude-window-${TMUX_PANE}"

ICON_BASH="🔧"
ICON_READ="📖"
ICON_EDIT="✏️"
ICON_WRITE="💾"
ICON_GREP="🔍"
ICON_GLOB="📂"
ICON_AGENT="🤖"
ICON_WEB_FETCH="🌐"
ICON_WEB_SEARCH="🔎"
ICON_ASK="❓"
ICON_DEFAULT="🔄"
ICON_PERMISSION="🔴"
ICON_PROMPT="🔄"
ICON_STOP="🟢"

ALL_ICONS=(
  "$ICON_BASH" "$ICON_READ" "$ICON_EDIT" "$ICON_WRITE" "$ICON_GREP"
  "$ICON_GLOB" "$ICON_AGENT" "$ICON_WEB_FETCH" "$ICON_WEB_SEARCH"
  "$ICON_ASK" "$ICON_DEFAULT" "$ICON_PERMISSION" "$ICON_STOP"
)

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

strip_icon() {
  local n="$1"
  for icon in "${ALL_ICONS[@]}"; do
    if [[ "$n" == "$icon "* ]]; then
      echo "${n#"$icon "}"
      return
    fi
  done
  echo "$n"
}

# Detects manual renames: if the live window name (minus any status icon)
# differs from the cached base, treat the live name as a new pinned base.
get_base_name() {
  local cached=""
  [[ -f "$state_file" ]] && cached=$(cat "$state_file")

  local current stripped
  current=$(tmux display-message -t "$TMUX_PANE" -p '#W' 2>/dev/null)
  stripped=$(strip_icon "$current")

  if [[ -n "$cached" && -n "$stripped" && "$stripped" != "$cached" ]]; then
    echo "$stripped" > "$state_file"
    echo "$stripped"
    return
  fi

  if [[ -n "$cached" ]]; then
    echo "$cached"
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
    Bash)            echo "$ICON_BASH" ;;
    Read)            echo "$ICON_READ" ;;
    Edit)            echo "$ICON_EDIT" ;;
    Write)           echo "$ICON_WRITE" ;;
    Grep)            echo "$ICON_GREP" ;;
    Glob)            echo "$ICON_GLOB" ;;
    Task|Agent)      echo "$ICON_AGENT" ;;
    WebFetch)        echo "$ICON_WEB_FETCH" ;;
    WebSearch)       echo "$ICON_WEB_SEARCH" ;;
    AskUserQuestion) echo "$ICON_ASK" ;;
    *)               echo "$ICON_DEFAULT" ;;
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
    rename_window "$ICON_PERMISSION $base_name"
    ;;
  UserPromptSubmit)
    base_name=$(get_base_name)
    rename_window "$ICON_PROMPT $base_name"
    ;;
  Stop)
    base_name=$(get_base_name)
    rename_window "$ICON_STOP $base_name"
    ;;
  SessionEnd)
    base_name=$(get_base_name)
    rename_window "$base_name"
    rm -f "$state_file"
    ;;
esac
