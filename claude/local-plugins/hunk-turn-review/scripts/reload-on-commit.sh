#!/bin/bash

# PostToolUse (Bash): when the agent commits mid-turn, re-point Hunk at the
# current baseline->worktree diff so each commit's changes are visible without
# waiting for Stop. No-op for any non-commit Bash call.
#
# Test: echo '{"tool_input":{"command":"git commit -m x"}}' | CLAUDE_PROJECT_DIR=$PWD ./reload-on-commit.sh

INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)
[ -z "$CMD" ] && exit 0

# Match `git commit` but not `git commit-tree`, `git commit-graph`, etc.
printf '%s' "$CMD" | grep -Eq '(^|[^[:alnum:]_-])git[[:space:]]+(-[^[:space:]]+[[:space:]]+)*commit([[:space:]]|$)' || exit 0

exec "$(dirname "$0")/reload.sh"
