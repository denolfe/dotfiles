---
name: zellij
description: Read from and write to other zellij panes. Use when user references another pane or needs to run commands in adjacent panes.
---

# Zellij Pane Controller

Read from and write to other zellij terminal panes using `zellij action` commands.

## Writing to Panes

**Send command (with Enter to execute):**

```bash
~/.claude/skills/zellij/tools/zellij-send.sh $'ls -la\n'
```

**Send text (without Enter, for partial input):**

```bash
~/.claude/skills/zellij/tools/zellij-send.sh "partial text"
```

**Specify direction:**

```bash
~/.claude/skills/zellij/tools/zellij-send.sh right $'echo hello\n'
~/.claude/skills/zellij/tools/zellij-send.sh left "some text"
```

Directions: `next` (default), `left`, `right`, `up`, `down`

## Reading from Panes

**View adjacent pane (visible screen):**

```bash
~/.claude/skills/zellij/tools/zellij-dump.sh next
```

**View pane in specific direction:**

```bash
~/.claude/skills/zellij/tools/zellij-dump.sh left
~/.claude/skills/zellij/tools/zellij-dump.sh right
~/.claude/skills/zellij/tools/zellij-dump.sh up
~/.claude/skills/zellij/tools/zellij-dump.sh down
```

**Include full scrollback:**

```bash
~/.claude/skills/zellij/tools/zellij-dump.sh next --full
```

## Layout Info

**Show tabs and panes:**

```bash
~/.claude/skills/zellij/tools/zellij-info.sh
```

## Creating Panes

**New pane (auto direction):**

```bash
~/.claude/skills/zellij/tools/zellij-new-pane.sh
```

**New pane with direction:**

```bash
~/.claude/skills/zellij/tools/zellij-new-pane.sh right
~/.claude/skills/zellij/tools/zellij-new-pane.sh down
```

**New pane and run command:**

```bash
~/.claude/skills/zellij/tools/zellij-new-pane.sh "npm run dev"
~/.claude/skills/zellij/tools/zellij-new-pane.sh down "tail -f /var/log/app.log"
```

## Limitations

- **Flicker on read/write**: Uses focus shift (zellij limitation)
- **Requires zellij session**: Only works inside zellij
