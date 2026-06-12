#!/bin/bash

# Stop: at the end of a turn, point the live Hunk session at the diff between
# this turn's baseline and the working tree, scoped to the files the agent
# touched. Shows edited + newly-created files, excludes untracked noise.
# Always exits 0 so it never blocks the agent.
#
# Test: CLAUDE_PROJECT_DIR=$PWD ./reload.sh

command -v hunk >/dev/null 2>&1 || exit 0

cd "${CLAUDE_PROJECT_DIR:-$PWD}" 2>/dev/null || exit 0
ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

hunk session get --repo "$ROOT" >/dev/null 2>&1 || exit 0
base=$(cat "$ROOT/.git/hunk-turn-base" 2>/dev/null)
[ -z "$base" ] && exit 0

# Deduplicate this turn's touched paths.
paths=()
while IFS= read -r p; do
  [ -n "$p" ] && paths+=("$p")
done < <(sort -u "$ROOT/.git/hunk-turn-files" 2>/dev/null)
[ ${#paths[@]} -eq 0 ] && exit 0 # nothing changed this turn; leave view as-is

hunk session reload --repo "$ROOT" -- diff "$base" -- "${paths[@]}" >/dev/null 2>&1
exit 0
