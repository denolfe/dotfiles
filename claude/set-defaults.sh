#!/usr/bin/env bash
# Set Claude Code default settings

SETTINGS_FILE="${HOME}/.claude/settings.json"


# Create settings file if it doesn't exist
if [[ ! -f "$SETTINGS_FILE" ]]; then
  mkdir -p "$(dirname "$SETTINGS_FILE")"
  echo '{}' > "$SETTINGS_FILE"
fi

echo "[SETTINGS] Applying default settings to $SETTINGS_FILE..."

# Apply default settings (hooks now managed via local plugins)
jq '
  .includeCoAuthoredBy = false |
  .env.SLASH_COMMAND_TOOL_CHAR_BUDGET = "50000"
' "$SETTINGS_FILE" > "${SETTINGS_FILE}.tmp" && mv "${SETTINGS_FILE}.tmp" "$SETTINGS_FILE"

echo "[SETTINGS] ✔ Default settings applied"

echo "[PLUGINS] Installing and enabling plugins..."

# External marketplace plugins
CLAUDE_PLUGINS=(
  "superpowers@superpowers-dev"
  "payload@payload-marketplace"
  "typescript-lsp@claude-plugins-official"
)

# Local plugins (from local-plugins marketplace)
LOCAL_PLUGINS=(
  "sounds"
  "zellij-activity"
  "git-guardrails"
)

# Loop through external plugins and install/enable/update each
for PLUGIN in "${CLAUDE_PLUGINS[@]}"; do
  NAME="${PLUGIN%%@*}"
  MARKETPLACE="${PLUGIN##*@}"
  FULL_NAME="$NAME@$MARKETPLACE"

  # Add marketplace if not already added
  claude plugin marketplace add "$MARKETPLACE" 2>/dev/null || echo "  ✔ $MARKETPLACE marketplace already added"

  # Install, enable, update plugin
  claude plugin install "$FULL_NAME" 2>/dev/null || echo "  ✔ $NAME already installed"
  claude plugin enable "$FULL_NAME" 2>/dev/null || echo "  ✔ $NAME already enabled"
  claude plugin update "$FULL_NAME"
done

echo "[PLUGINS] ✔ External plugins installed"

# Add local marketplace and install local plugins
echo "[LOCAL] Installing local plugins..."

LOCAL_MARKETPLACE="${HOME}/.claude/local-plugins"
if [[ -d "$LOCAL_MARKETPLACE" ]]; then
  claude plugin marketplace add "$LOCAL_MARKETPLACE" 2>/dev/null || echo "  ✔ local marketplace already added"
  claude plugin marketplace update local 2>/dev/null

  for PLUGIN in "${LOCAL_PLUGINS[@]}"; do
    FULL_NAME="$PLUGIN@local"
    claude plugin install "$FULL_NAME" 2>/dev/null || echo "  ✔ $PLUGIN already installed"
    claude plugin enable "$FULL_NAME" 2>/dev/null || echo "  ✔ $PLUGIN already enabled"
  done

  echo "[LOCAL] ✔ Local plugins installed"
else
  echo "[LOCAL] ⚠ Local marketplace not found at $LOCAL_MARKETPLACE"
  echo "        Run: ln -s ~/.dotfiles/claude/local-plugins ~/.claude/local-plugins"
fi

echo "[DONE] ✔ Claude Code setup complete"
