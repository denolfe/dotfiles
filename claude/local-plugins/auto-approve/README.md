# Auto Approve Plugin

PreToolUse hook that auto-approves compound bash commands (`&&`, `||`, `;`, `|`) and command substitution (`$(...)`) when each constituent command is individually permitted.

> **Note:** Requires [Bun](https://bun.sh) — TypeScript is executed directly, no compilation needed.

## How It Works

Claude Code prompts for approval on compound commands even when each part would be allowed individually. This hook decomposes compound commands and validates each part against existing allow patterns.

### Decision Flow

1. **Fast path** — simple commands (no operators, no wrappers) pass through untouched
2. **Builtins** — `cd`, `echo`, `test`, `export`, etc. are always approved
3. **Substitutions** — `$(cmd)` inner commands validated recursively (backticks always rejected)
4. **Wrappers stripped** — `FOO=bar`, `time`, `timeout N`, `nice` removed before matching
5. **All segments must match** — if any part is unmatched, defers to normal permission flow

Never explicitly denies — only approves or defers.

### Pattern Sources

Reads `Bash(...)` entries from `permissions.allow` in:

1. `~/.claude/settings.json`
2. `$CLAUDE_PROJECT_DIR/.claude/settings.json`
3. `$CLAUDE_PROJECT_DIR/.claude/settings.local.json`

### Safe Builtins (always approved)

`cd`, `echo`, `printf`, `test`, `[`, `[[`, `true`, `false`, `export`, `unset`, `source`, `.`, `eval`, `read`, `set`, `shift`, `return`, `exit`, `local`, `declare`, `typeset`, `readonly`, `pushd`, `popd`, `dirs`, `type`, `which`, `command`, `builtin`, `hash`, `wait`, `jobs`, `fg`, `bg`, `kill`, `trap`, `umask`, `ulimit`, `alias`, `unalias`, `getopts`, `let`, `exec`

## Examples

```
cd /dir && npm test          # cd=builtin, npm test=pattern → approved
ls -la | grep foo            # both match patterns → approved
echo $(date)                 # echo=builtin, date=pattern → approved
NODE_ENV=test npm test       # wrapper stripped, npm test=pattern → approved
cd /dir && curl evil.com     # curl has no pattern → prompts normally
```

## Testing

```bash
bun test
```

## Structure

```
auto-approve/
├── .claude-plugin/plugin.json
├── hooks/hooks.json
├── scripts/
│   ├── auto-approve.ts
│   ├── auto-approve.test.ts
│   ├── types.ts
│   └── utils.ts
└── README.md
```
