#!/usr/bin/env bash
# Update and install Claude Code local plugins

LOCAL_MARKETPLACE="${HOME}/.claude/local-plugins"
LOCAL_PLUGINS=(
  "sounds"
  "zellij-activity"
  "git-guardrails"
)

if [[ ! -d "$LOCAL_MARKETPLACE" ]]; then
  echo "[LOCAL] ⚠ Local marketplace not found at $LOCAL_MARKETPLACE"
  echo "        Run: ln -s ~/.dotfiles/claude/local-plugins ~/.claude/local-plugins"
  exit 1
fi

echo "[LOCAL] Updating local marketplace..."
claude plugin marketplace update local 2>/dev/null || claude plugin marketplace add "$LOCAL_MARKETPLACE"

echo "[LOCAL] Installing local plugins..."
for PLUGIN in "${LOCAL_PLUGINS[@]}"; do
  FULL_NAME="$PLUGIN@local"
  claude plugin install "$FULL_NAME" 2>/dev/null || echo "  ✔ $PLUGIN already installed"
  claude plugin enable "$FULL_NAME" 2>/dev/null || echo "  ✔ $PLUGIN already enabled"
done

echo "[LOCAL] ✔ Done"
