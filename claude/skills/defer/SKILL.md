---
name: defer
description: Use when you notice something to fix later while working on another task - captures context without breaking flow (~10 seconds)
---

# Defer

Capture side tasks noticed during development without context-switching.

## Usage

```
/defer <description>
/defer              # infer from conversation context
```

## Workflow (~10 seconds)

1. **Parse argument** → generate slug (if no argument, infer from recent conversation)
2. **Get branch** → `git branch --show-current`
3. **Get task** → check if in `~/.claude/plans/`, grab task name
4. **Gather context** → recent files from conversation (no reads/greps)
5. **Infer** → why noticed, suggested approach if obvious
6. **Write** → `~/.claude/deferred/{YYYY-MM-DD}_{slug}.md`
7. **Output path** → return to main work (no confirmation prompt)

## Output Format

```markdown
# <Issue Title>

**Noticed while:** <branch> / <task if any>
**Date:** YYYY-MM-DD

## What
<Description>

## Where
<Recent files from conversation, if relevant>

## Why I Noticed
<Connection to current work>

## Suggested Approach
<Quick notes if obvious, otherwise omit>
```

## Edge Cases

- No argument → infer from conversation, generate slug
- Directory missing → create `~/.claude/deferred/`
- Duplicate slug same day → append `-2`, `-3`

## Not in Scope

- Listing/reviewing deferred items
- Promoting to task (user does via `/task`)
- Cleanup/archival
