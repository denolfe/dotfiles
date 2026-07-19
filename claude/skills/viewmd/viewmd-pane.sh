#!/bin/sh
# Open a markdown file with `viewmd` in an adjacent tmux pane. Target order:
#   1. an existing viewmd pane (marked @viewmd) -- reused, replacing any run
#   2. else an idle sibling pane (a shell with no running process) -- taken over
#   3. else a new pane split off to the right
# Focus stays on the calling pane.
#
# Usage: viewmd-pane.sh <file.md>

file="$1"

if [ -z "$file" ]; then
  echo "usage: viewmd-pane.sh <file.md>" >&2
  exit 2
fi
if [ ! -f "$file" ]; then
  echo "no such file: $file" >&2
  exit 2
fi

# Absolute path so the target pane resolves it regardless of its own cwd.
abs=$(cd "$(dirname "$file")" && printf '%s/%s' "$PWD" "$(basename "$file")")

if [ -z "$TMUX" ]; then
  echo "Not inside tmux. Run this instead:"
  echo "viewmd \"$abs\""
  exit 0
fi

# `exec $SHELL` keeps the pane alive after viewmd exits, so the marked pane
# persists for reuse even if the user quits viewmd manually.
launch="viewmd '$abs'; exec \${SHELL:-/bin/sh} -i"

# $TMUX_PANE is the caller's own pane (this script's pane). Never target it --
# it is what runs the agent/shell that invoked the skill. Scope every lookup to
# the caller's window: `list-panes` otherwise defaults to the attached client's
# active window, which may not be where the caller lives.
self="$TMUX_PANE"
win=$(tmux display-message -p -t "$self" '#{window_id}' 2>/dev/null)

# A shell sitting at a bare prompt is the only safe takeover target. Requiring
# the foreground to be a shell protects panes running an app (claude, vim, ...);
# an app that is its pane's own process has no child, so a child-only check
# would wrongly see it as idle.
is_shell() {
  case "$1" in
    zsh | -zsh | bash | -bash | sh | -sh | fish | -fish) return 0 ;;
    *) return 1 ;;
  esac
}

# A marked pane is safe to reclaim only when idle (shell has no child) or when
# the child is our own viewmd viewer. The @viewmd marker persists after viewmd
# quits, so the pane may since have been used to run something else -- never
# force-kill that. Returns 0 = reclaimable, 1 = busy with a foreign command.
pane_reclaimable() {
  kids=$(pgrep -P "$1" 2>/dev/null) || return 0
  [ -z "$kids" ] && return 0
  for k in $kids; do
    case "$(ps -o command= -p "$k" 2>/dev/null)" in
      *viewmd.cjs* | *"/viewmd "* | */viewmd) continue ;;
    esac
    return 1
  done
  return 0
}

# 1. Reuse an existing viewmd pane (marked @viewmd) that is idle or still ours;
#    never the caller's, never one now running someone else's command. Scan all
#    marked panes (no early break) so every stale marker gets relinquished, not
#    just the ones before the first reuse target.
target=""
while IFS=' ' read -r pane_id pane_pid marker; do
  [ "$marker" = "1" ] || continue
  [ "$pane_id" = "$self" ] && continue
  # Marked pane now runs the user's own command: relinquish our claim on it so
  # it stops being a reuse target, and leave it running.
  if ! pane_reclaimable "$pane_pid"; then
    tmux set-option -pu -t "$pane_id" @viewmd 2>/dev/null
    continue
  fi
  [ -z "$target" ] && target="$pane_id"
done <<EOF
$(tmux list-panes -t "$win" -F '#{pane_id} #{pane_pid} #{@viewmd}')
EOF

if [ -n "$target" ]; then
  # -k replaces an idle shell or our own running viewmd (checked reclaimable).
  tmux respawn-pane -k -c "$PWD" -t "$target" "$launch"
  tmux set-option -p -t "$target" @viewmd 1
  echo "Reused viewmd pane $target for $abs"
  exit 0
fi

# 2. Take over an idle sibling: a bare shell (no child process), not the caller.
# Prefer a pane to the right of the caller; a running command is never touched.
active_left=$(tmux display-message -p -t "$self" '#{pane_left}' 2>/dev/null)
idle_any=""
idle_right=""
while IFS=' ' read -r pane_id pane_pid pane_cmd pane_left; do
  [ "$pane_id" = "$self" ] && continue
  is_shell "$pane_cmd" || continue
  pgrep -P "$pane_pid" >/dev/null 2>&1 && continue
  [ -z "$idle_any" ] && idle_any="$pane_id"
  if [ -z "$idle_right" ] && [ "${pane_left:-0}" -gt "${active_left:-0}" ] 2>/dev/null; then
    idle_right="$pane_id"
  fi
done <<EOF
$(tmux list-panes -t "$win" -F '#{pane_id} #{pane_pid} #{pane_current_command} #{pane_left}')
EOF

target="${idle_right:-$idle_any}"
if [ -n "$target" ]; then
  tmux respawn-pane -k -c "$PWD" -t "$target" "$launch"
  tmux set-option -p -t "$target" @viewmd 1
  echo "Took over idle pane $target for $abs"
  exit 0
fi

# No reusable pane: split a new one. `-d` keeps focus on this pane.
pane=$(tmux split-window -d -h -t "$self" -P -F '#{pane_id}' -c "$PWD" "$launch")
tmux set-option -p -t "$pane" @viewmd 1
echo "Opened viewmd in new pane $pane for $abs"
