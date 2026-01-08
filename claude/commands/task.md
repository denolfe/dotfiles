---
description: Create a new task file for a specific task or feature development
argument-hint: <task-name-or-desc>
allowed-tools: Write, Bash(mkdir:*), Bash(date:*)
---

# New Task

- Create the following structure in `~/.claude/plans/`:

  ```
  ~/.claude/plans/
    ├── `{timestamp}-{task-name}`/ # Each task in its own timestamped folder
    │     ├── 1-TASK.md # This is the main task description or details provided to brainstorming skill
    │     └── ...
    └── another-task/
          ├── 1-TASK.md
          └── ...
  ```

- The task-name should be a short, hyphenated version of the provided task name or description argument (e.g., "implement-authentication", "refactor-database-layer"). Be concise and summarize if necessary.
- Find the <plans-directory>, if the project has an existing `./docs/plans` directory, use that instead of `~/.claude/plans/`.
- Create the directory with `mkdir -p <plans-directory>/$(date +%Y-%m-%d)-task-name` but replace `task-name` with the hyphenated version of the provided task name or description.
- 1-TASK.md should contain a single H1 header with the provided task name or description.

Once created:

- Present the 1-TASK.md contents
- AskUserQuestion:
  - Add more details to 1-TASK.md now before proceeding
  - Brainstorm design using `superpowers:brainstorming`
  - Just implement directly
