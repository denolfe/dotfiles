#!/usr/bin/env bash
# Set Claude Code default settings

SETTINGS_FILE="${HOME}/.claude/settings.json"


# Create settings file if it doesn't exist
if [[ ! -f "$SETTINGS_FILE" ]]; then
  mkdir -p "$(dirname "$SETTINGS_FILE")"
  echo '{}' > "$SETTINGS_FILE"
fi

echo "[SETTINGS] Applying default settings to $SETTINGS_FILE..."

# Apply default settings
jq '
  .includeCoAuthoredBy = false |
  .env.SLASH_COMMAND_TOOL_CHAR_BUDGET = "50000"
' "$SETTINGS_FILE" > "${SETTINGS_FILE}.tmp" && mv "${SETTINGS_FILE}.tmp" "$SETTINGS_FILE"

echo "[SETTINGS] ✔ Default settings applied"

echo "[PLUGINS] Installing and enabling plugins..."

CLAUDE_PLUGINS=(
  "superpowers@superpowers-dev"
  "payload@payload-marketplace"
  "typescript-lsp@claude-plugins-official"
)

# Loop through plugins and install/enable/update each
for PLUGIN in "${CLAUDE_PLUGINS[@]}"; do
  NAME="${PLUGIN%%@*}"
  MARKETPLACE="${PLUGIN##*@}"
  FULL_NAME="$NAME@$MARKETPLACE"

  # Add marketplace if not already added
  claude plugin marketplace add "$MARKETPLACE" 2>/dev/null || echo "✔ $MARKETPLACE marketplace already added"

  # Install, enable, update plugin
  claude plugin install "$FULL_NAME" 2>/dev/null || echo "✔ $NAME plugin already installed"
  claude plugin enable "$FULL_NAME" 2>/dev/null || echo "✔ $NAME plugin already enabled"
  claude plugin update "$FULL_NAME"
done

echo "[PLUGINS] ✔ All plugins installed and enabled"
