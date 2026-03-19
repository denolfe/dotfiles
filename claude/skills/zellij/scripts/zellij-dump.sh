#!/usr/bin/env bash
# Dump screen content from a zellij pane
# Usage: zellij-dump.sh [direction] [--full]
# direction: left|right|up|down|next (default: next)
# --full: include scrollback history

set -euo pipefail

direction="${1:-next}"
full_flag=""
[[ "${2:-}" == "--full" || "${1:-}" == "--full" ]] && full_flag="-f"

# Handle --full as first arg
if [[ "$direction" == "--full" ]]; then
  direction="next"
fi

output_file="/tmp/zellij-pane-dump-$$.txt"

case "$direction" in
  next)
    zellij action focus-next-pane
    ;;
  left|right|up|down)
    zellij action move-focus "$direction"
    ;;
  *)
    echo "Invalid direction: $direction" >&2
    exit 1
    ;;
esac

sleep 0.1
zellij action dump-screen $full_flag "$output_file"
sleep 0.1
zellij action focus-previous-pane

cat "$output_file"
rm -f "$output_file"
