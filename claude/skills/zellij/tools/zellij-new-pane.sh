#!/usr/bin/env bash
# Create a new pane, optionally run a command
# Usage: zellij-new-pane.sh [direction] [command]
# direction: right|down (default: right)
# If command provided, runs it in new pane

set -euo pipefail

direction=""
command=""

# Parse args
case "${1:-}" in
  right|down)
    direction="$1"
    shift
    command="$*"
    ;;
  "")
    ;;
  *)
    command="$*"
    ;;
esac

# Create pane
if [[ -n "$direction" ]]; then
  zellij action new-pane --direction "$direction"
else
  zellij action new-pane
fi

# Run command if provided
if [[ -n "$command" ]]; then
  sleep 0.2
  zellij action write-chars "$command"
  zellij action write 10  # Enter key
fi
