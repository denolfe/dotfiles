#!/bin/bash

# UserPromptSubmit: snapshot the repo's tracked state at the START of a turn so
# reload.sh can show exactly what this turn changed. Non-destructive
# (`git stash create` touches nothing). Only runs when a live Hunk session is
# open for this repo, to avoid overhead in unrelated repos.
#
# Test: echo '{}' | CLAUDE_PROJECT_DIR=$PWD ./baseline.sh

command -v hunk >/dev/null 2>&1 || exit 0

cd "${CLAUDE_PROJECT_DIR:-$PWD}" 2>/dev/null || exit 0
ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

# Skip unless Hunk is reviewing this repo (keeps prompts fast elsewhere).
hunk session get --repo "$ROOT" >/dev/null 2>&1 || exit 0

base=$(git stash create 2>/dev/null)
[ -z "$base" ] && base=$(git rev-parse HEAD 2>/dev/null)
[ -z "$base" ] && exit 0

printf '%s\n' "$base" > "$ROOT/.git/hunk-turn-base"
: > "$ROOT/.git/hunk-turn-files" # reset this turn's touched-files list
exit 0
