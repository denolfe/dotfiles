#!/usr/bin/env bash
# Sync cwd of all shell panes in the current tmux window to $1.
# Invoked from tmux pane-mode `s` binding.

set -eu

target="${1:-}"
[ -z "$target" ] && exit 0

# Expand ~ and resolve to absolute path
eval target="$target"
target="$(cd "$target" 2>/dev/null && pwd)" || exit 1

shell_name="${SHELL##*/}"

while read -r pane_id cmd path; do
  [ "${cmd#-}" = "$shell_name" ] || continue
  [ "$path" = "$target" ] && continue
  tmux send-keys -t "$pane_id" " cd '$target' && clear" Enter
done < <(tmux list-panes -F '#{pane_id} #{pane_current_command} #{pane_current_path}')
