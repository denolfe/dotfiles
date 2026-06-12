#!/bin/bash

# PostToolUse (Write|Edit|MultiEdit|NotebookEdit): record each file the agent
# touches this turn, relative to its git root. reload.sh scopes Hunk to these
# paths so new (untracked) files show without dragging in pre-existing
# untracked dirs.
#
# Test: echo '{"tool_input":{"file_path":"'"$PWD"'/README.md"}}' | ./record.sh

INPUT=$(cat)
FILE=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$FILE" ] && exit 0

DIR=$(dirname "$FILE")
ROOT=$(git -C "$DIR" rev-parse --show-toplevel 2>/dev/null) || exit 0
[ -f "$ROOT/.git/hunk-turn-base" ] || exit 0 # no active turn baseline; skip

printf '%s\n' "${FILE#"$ROOT"/}" >> "$ROOT/.git/hunk-turn-files"
exit 0
