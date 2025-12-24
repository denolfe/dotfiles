#!/usr/bin/env bash
# Set Claude Code default settings

SETTINGS_FILE="${HOME}/.claude/settings.json"

# Create settings file if it doesn't exist
if [[ ! -f "$SETTINGS_FILE" ]]; then
  mkdir -p "$(dirname "$SETTINGS_FILE")"
  echo '{}' > "$SETTINGS_FILE"
fi

# Apply default settings
jq '
  .includeCoAuthoredBy = false |
  .env.SLASH_COMMAND_TOOL_CHAR_BUDGET = "50000"
' "$SETTINGS_FILE" > "${SETTINGS_FILE}.tmp" && mv "${SETTINGS_FILE}.tmp" "$SETTINGS_FILE"

echo "Claude Code defaults applied to $SETTINGS_FILE"

# Install superpowers plugin for Claude Code

# Add marketplace (ignore if exists)
claude plugin marketplace add obra/superpowers 2>/dev/null || true

# Install plugin
claude plugin install superpowers@superpowers-dev

# Enable plugin (ignore if already enabled)
claude plugin enable superpowers@superpowers-dev 2>/dev/null || true
