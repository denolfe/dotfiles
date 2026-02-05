#!/usr/bin/env bash
# Send text/commands to another zellij pane
# Usage: zellij-send.sh [direction] <text>
# direction: left|right|up|down|next (default: next)
# Add trailing newline to execute as command

set -euo pipefail

direction="next"
text=""

# Parse args
if [[ $# -eq 1 ]]; then
  text="$1"
elif [[ $# -ge 2 ]]; then
  case "$1" in
    left|right|up|down|next)
      direction="$1"
      shift
      text="$*"
      ;;
    *)
      text="$*"
      ;;
  esac
fi

if [[ -z "$text" ]]; then
  echo "Usage: zellij-send.sh [direction] <text>" >&2
  echo "  direction: left|right|up|down|next (default: next)" >&2
  exit 1
fi

# Focus target pane
case "$direction" in
  next)
    zellij action focus-next-pane
    ;;
  left|right|up|down)
    zellij action move-focus "$direction"
    ;;
esac

# Write the text
zellij action write-chars "$text"

# Return focus
zellij action focus-previous-pane
