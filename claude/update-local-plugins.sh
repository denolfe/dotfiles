#!/usr/bin/env bash
# Install/update the local-plugins marketplace and every plugin it declares.
# Idempotent: safe to re-run. Plugin list is derived from marketplace.json,
# so adding/removing a plugin there is all that's needed.

set -euo pipefail

LOCAL_MARKETPLACE="${HOME}/.claude/local-plugins"
MANIFEST="${LOCAL_MARKETPLACE}/.claude-plugin/marketplace.json"

if [[ ! -d "$LOCAL_MARKETPLACE" ]]; then
  echo "[LOCAL] ⚠ Local marketplace not found at $LOCAL_MARKETPLACE"
  echo "        Run: ln -s ~/.dotfiles/claude/local-plugins ~/.claude/local-plugins"
  exit 1
fi

if [[ ! -f "$MANIFEST" ]]; then
  echo "[LOCAL] ✘ Marketplace manifest not found at $MANIFEST" >&2
  exit 1
fi

echo "[LOCAL] Updating local marketplace..."
claude plugin marketplace update local 2>/dev/null || claude plugin marketplace add "$LOCAL_MARKETPLACE"

echo "[LOCAL] Installing/updating plugins from manifest..."
while IFS= read -r PLUGIN; do
  [[ -z "$PLUGIN" ]] && continue
  FULL_NAME="${PLUGIN}@local"
  claude plugin install "$FULL_NAME" 2>/dev/null || echo "  ✔ ${PLUGIN} already installed"
  claude plugin enable "$FULL_NAME" 2>/dev/null || echo "  ✔ ${PLUGIN} already enabled"
  claude plugin update "$FULL_NAME" 2>/dev/null || true
done < <(jq -r '.plugins[].name' "$MANIFEST")

echo "[LOCAL] ✔ Done"
