#!/usr/bin/env bash
# Set Claude Code spinner verbs from verbs.json into ~/.claude/settings.json.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERBS="${SCRIPT_DIR}/verbs.json"
SETTINGS="${HOME}/.claude/settings.json"

if [[ ! -f "$VERBS" ]]; then
  echo "✘ verbs file not found: $VERBS" >&2
  exit 1
fi
if [[ ! -f "$SETTINGS" ]]; then
  echo "✘ settings not found: $SETTINGS" >&2
  exit 1
fi

jq --slurpfile verbs "$VERBS" '.spinnerVerbs = {"mode": "replace", "verbs": $verbs[0]}' "$SETTINGS" > "${SETTINGS}.tmp"
mv "${SETTINGS}.tmp" "$SETTINGS"
echo "✔ spinner verbs set from $VERBS"
