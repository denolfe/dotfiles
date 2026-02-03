# Local Plugin Marketplace

Local Claude Code plugins, symlinked to `~/.claude/local-plugins`.

## Current Plugins

- **sounds** - Audio notifications (PermissionRequest, Stop)
- **zellij-activity** - Zellij tab status updates (6 events)
- **git-guardrails** - Git workflow enforcement (PreToolUse/Bash)

## Notes

- Plugins are copied to `~/.claude/plugins/cache/local/` on install
- After editing source, run `/plugin marketplace update local` then reinstall
- Use `${CLAUDE_PLUGIN_ROOT}` for relative script paths

## Setup

```bash
ln -s ~/.dotfiles/claude/local-plugins ~/.claude/local-plugins
```

Then in Claude Code:
```
/plugin marketplace add ~/.claude/local-plugins
```

## Adding a New Plugin

1. Create plugin directory:
   ```
   new-plugin/
   ├── .claude-plugin/plugin.json
   ├── hooks/hooks.json
   └── scripts/           # optional
   ```

2. Add to `.claude-plugin/marketplace.json`:
   ```json
   {
     "name": "new-plugin",
     "description": "...",
     "version": "0.0.1",
     "source": "./new-plugin"
   }
   ```

3. Update and install:
   ```
   /plugin marketplace update local
   /plugin  # → Browse and install → local → new-plugin
   ```

## Plugin Structure

### plugin.json
```json
{
  "name": "plugin-name",
  "description": "What it does",
  "version": "0.0.1"
}
```

### hooks/hooks.json
```json
{
  "description": "Hook description",
  "hooks": {
    "EventName": [
      {
        "matcher": "optional-regex",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/script.sh"
          }
        ]
      }
    ]
  }
}
```

## Hook Events

| Event             | When                       | Can Block?    |
| ----------------- | -------------------------- | ------------- |
| SessionStart      | Session begins/resumes     | No            |
| UserPromptSubmit  | Before prompt processing   | Yes           |
| PreToolUse        | Before tool execution      | Yes           |
| PostToolUse       | After successful tool      | Feedback only |
| PermissionRequest | Permission dialog shown    | Yes           |
| Stop              | Claude finishes responding | Yes           |
| SessionEnd        | Session terminates         | No            |
