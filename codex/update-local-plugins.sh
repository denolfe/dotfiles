#!/usr/bin/env bash
# Register this checkout's marketplace and install/refresh every listed plugin.
# Codex manages its config and cache; hook trust remains an interactive review.
set -euo pipefail

for dependency in codex jq; do
  if ! command -v "$dependency" >/dev/null 2>&1; then
    echo "[CODEX] Required command not found: $dependency" >&2
    exit 1
  fi
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MARKETPLACE_ROOT="${SCRIPT_DIR}/local-plugins"
MANIFEST="${MARKETPLACE_ROOT}/.agents/plugins/marketplace.json"

# Read and validate before changing Codex's configuration. Keep jq outside
# process substitution so a parsing failure cannot silently skip installation.
MARKETPLACE_NAME=$(jq -er '.name | strings | select(length > 0)' "$MANIFEST")
PLUGINS=$(jq -er '
  .plugins
  | if type == "array" and all(.[]; (.name | type == "string" and length > 0))
    then map(.name) | join("\n")
    else error("plugins must be an array of named plugin entries") end
' "$MANIFEST")

echo "[CODEX] Registering ${MARKETPLACE_NAME}..."
codex plugin marketplace add "$MARKETPLACE_ROOT" </dev/null

FAILED=0
while IFS= read -r plugin; do
  [[ -z "$plugin" ]] && continue
  echo "[CODEX] Installing/refreshing ${plugin}@${MARKETPLACE_NAME}..."
  if ! codex plugin add "${plugin}@${MARKETPLACE_NAME}" </dev/null; then
    FAILED=1
  fi
done <<<"$PLUGINS"

if [[ $FAILED -ne 0 ]]; then
  echo "[CODEX] One or more plugins failed to install" >&2
  exit 1
fi

echo "[CODEX] Done. Start a new Codex session and review pending hooks with /hooks."
