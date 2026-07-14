---
description: Sidebar for current conversation - fork the current conversation into a new tmux pane
argument-hint: "[--print]"
allowed-tools: Bash
---

# Fork current session

Fork **this** conversation into a new session (new session ID, same history)
via `claude --resume <id> --fork-session`. Defaults to a new tmux pane; use
`--print` to just output the command.

## Result

!`
sid="${CLAUDE_CODE_SESSION_ID:-}"
if [ -z "$sid" ]; then
  echo "Session ID unknown — run /status to find it, do not fabricate one."
elif echo "$ARGUMENTS" | grep -q -- --print; then
  echo "Copy/paste to fork this session:"
  echo "cd $PWD && claude --resume $sid --fork-session"
elif [ -z "$TMUX" ]; then
  echo "Not inside tmux. Run this instead:"
  echo "cd $PWD && claude --resume $sid --fork-session"
else
  tmux split-window -h -c "$PWD" "claude --resume $sid --fork-session" \
    && echo "Forked into a new tmux pane to the right (session $sid)." \
    || echo "tmux split-window failed."
fi
`

Report the result above to the user verbatim in a single sentence; if it
contains commands, present them in a `bash` block.
