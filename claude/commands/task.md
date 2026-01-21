---
description: Create a new task file for a specific task or feature development
argument-hint: <task-name-or-desc>
allowed-tools: Bash(~/.claude/commands/task.sh:*), Read
---

# New Task

Run `~/.claude/commands/task.sh <task-name> "<task-title>"` where:

- `task-name`: hyphenated, lowercase, 2-4 words summarizing the argument
- `task-title`: the original argument text (for the H1 header)

The script outputs the created directory path.

Once created:

- Read and present the 1-TASK.md contents
- AskUserQuestion:
  - Brainstorm design using `superpowers:brainstorming`
  - Add more details to 1-TASK.md now before proceeding
  - Just implement directly
