#!/usr/bin/env bash
# Reinstall all global skills from the lock file.
# Two agents force symlink mode: content in ~/.agents/skills, ~/.claude/skills
# symlinks to it. A single agent would copy and duplicate instead.
set -euo pipefail

LOCK="${HOME}/.agents/.skill-lock.json"

if [[ ! -f "$LOCK" ]]; then
  echo "⚠ Lock file not found at $LOCK"
  exit 1
fi

jq -r '.skills | to_entries[] | "\(.value.source)\t\(.key)"' "$LOCK" |
  while IFS=$'\t' read -r src name; do
    printf '→ %-34s %s ' "$name" "$src"
    # </dev/null: npx would otherwise drain the loop's piped stdin.
    # No --quiet flag exists, so suppress output and report per-skill status.
    if out=$(npx skills add -g "$src" --skill "$name" --agent universal claude-code --yes </dev/null 2>&1); then
      echo "✓"
    else
      echo "✗"
      echo "$out" >&2
    fi
  done
