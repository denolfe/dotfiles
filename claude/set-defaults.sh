#!/usr/bin/env bash
# Set Claude Code default settings

SETTINGS_FILE="${HOME}/.claude/settings.json"

# Create settings file if it doesn't exist
if [[ ! -f "$SETTINGS_FILE" ]]; then
  mkdir -p "$(dirname "$SETTINGS_FILE")"
  echo '{}' > "$SETTINGS_FILE"
fi

echo "[SETTINGS] Applying default settings to $SETTINGS_FILE..."

# Apply default settings (plugins via `make claude-plugins`, verbs via `make claude-verbs`)
jq '
  .attribution = {"commit": "", "pr": ""} |
  .env.SLASH_COMMAND_TOOL_CHAR_BUDGET = "50000" |
  .env.CLAUDE_CODE_SUPPRESS_SESSION_ATTRIBUTION = "1" |
  .env.CLAUDE_CODE_DISABLE_AUTO_MEMORY = "1" |
  .env.FORCE_COLOR = "3" |
  .alwaysThinkingEnabled = true |
  .effortLevel = "medium" |
  .skipWorkflowUsageWarning = true |
  .verbose = true |
  .statusLine = {"type": "command", "command": "~/.claude/statusline-command.sh"}
' "$SETTINGS_FILE" > "${SETTINGS_FILE}.tmp" && mv "${SETTINGS_FILE}.tmp" "$SETTINGS_FILE"

echo "[SETTINGS] ✔ Default settings applied"
echo "[DONE] ✔ Claude Code setup complete"
