# Local Plugin Marketplace

Local Claude Code plugins, symlinked to `~/.claude/local-plugins`.

## Current Plugins

Local (source lives in this dir):

- **sounds** - Audio notifications (PermissionRequest, Stop)
- **tmux-agent-status** - Agent status in tmux window name
- **git-guardrails** - Git workflow enforcement (PreToolUse/Bash)
- **auto-approve** - Auto-approves compound bash commands matching allow patterns
- **hunk-turn-review** - Scopes a live Hunk diff session to each turn's changes (UserPromptSubmit/PostToolUse/Stop)

Remote (pinned github source in `marketplace.json`, no local code):

- **superpowers-extended-cc** - CC-specific fork of Superpowers, pinned to `denolfe/superpowers@customized-5.2.8`. Dev in `~/dev/superpowers-fork`; commit + push the branch, then `make claude-plugins` to pull.

## Install / Update

Run `make claude-plugins` (→ `claude/update-local-plugins.sh`). Idempotent: adds-or-updates the `local` marketplace, then installs/enables/updates **every** plugin listed in `marketplace.json` (list is derived via `jq`, not hardcoded). This is also the update command for the pinned github plugins.

## Notes

- Local plugins are copied to `~/.claude/plugins/cache/local/` on install
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
