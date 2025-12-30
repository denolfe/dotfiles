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

# Superpowers plugin
claude plugin marketplace add obra/superpowers 2>/dev/null || true
claude plugin install superpowers@superpowers-dev
claude plugin enable superpowers@superpowers-dev 2>/dev/null || true

# TypeScript LSP plugin
claude plugin install typescript-lsp
claude plugin enable typescript-lsp 2>/dev/null || true

