# Critical Partner Mindset

- Do not affirm my statements or assume my conclusions are correct. Question assumptions, offer counterpoints, test reasoning. Prioritize truth over agreement.
- Be extremely concise. Sacrifice grammar for the sake of concision.

# Working with superpowers plugin

- When using `superpowers` skills, if directed to write to `docs/plans`, instead write to `~/.claude/plans` or the project's `./docs/plans` directory. This is to avoid cluttering the main repository with temporary plan files that will not be kept or committed.
- The files should be written in the following tree structure:

  ```
  ~/.claude/plans/
    ├── `{timestamp}-{task-name}`/ # Each task in its own timestamped folder
    │     ├── 1-TASK.md # This is the main task description or details provided to brainstorming skill
    │     ├── 2-DESIGN.md # This is the resulting design file from the `superpowers:brainstorming` skill
    │     ├── 3-PLAN.md # This is the output of `superpowers:writing-plans` skill
    │     └── ...
    └── another-task/
          ├── 3-PLAN.md
          └── ...
  ```

- `superpowers:brainstorming` skill should:
  - Write the provided prompt and context to `1-TASK.md`
  - Generate a structured plan and write to `2-DESIGN.md`. Add all clarifying questions asked during brainstorming and _all_ options considered to the end of the `2-DESIGN.md` file.
- `superpowers:writing-plans` skill should:
  - Read the `2-DESIGN.md` file from the respective plan folder
  - Write the resulting implementation details to `3-PLAN.md` in the same folder.

# Node.js Preferences

- Always use pnpm for package management.
- Always use vitest for testing.

# Coding Patterns and Best Practices (Typescript)

- Prefer function object parameter over multiple parameters. Better readability, easier to extend, clearer intent at call site.
  ```ts
  // Correct
  function createUser(params: { name: string; email: string; role: string }) {
    // ...
  }

  // Avoid
  function createUser(name: string, email: string, role: string) {
    // ...
  }
  ```
- Prefer types over interfaces (except when extending external types)
- Prefer functions over classes (classes only for errors/adapters)
- Prefer pure functions; when mutation is unavoidable, return the mutated object instead of void.
- Organize functions top-down: exports before helpers
- Use JSDoc for complex functions; add tags only when justified beyond type signature
- Use `import type` for types, regular `import` for values, separate statements even from same module
- Prefix booleans with `is`/`has`/`can`/`should` (e.g., `isValid`, `hasData`) for clarity
- Commenting Guidelines
  - Execution flow: Skip comments when code is self-documenting. Keep for complex logic, non-obvious "why", multi-line context, or if following a documented, multi-step flow.
  - Top of file/module: Use sparingly; only for non-obvious purpose/context or an overview of complex logic.
  - Type definitions: Property/interface JSDoc is encouraged and always acceptable.
  - No fossil comments about previous implementations, migrations, or refactors. If code is gone, comment is gone. Git tracks "what changed".

# Bash Permission Pattern Matching

**NEVER use flags before git subcommands.** This breaks permission matching.

Forbidden patterns:

- `git -C /path <cmd>` ← NEVER USE
- `git -c config.key=value <cmd>` ← NEVER USE

Required patterns:

- `cd /path && git <cmd>` ← ALWAYS USE THIS
- `git <cmd> /path` ← or this when command supports it

Why: Permissions match `git log:*`, `git diff:*` etc. Flags before the subcommand break the prefix match.

[Docs](https://docs.claude.com/en/docs/claude-code/iam#tool-specific-permission-rules)

# Self Improvement

- When a repeated correction or better approach is found, you're encouraged to codify your new found knowledge and learnings by modifying your section of ~/.claude/CLAUDE.md. Notify the user of the change by saying "INTERNAL INSTRUCTIONS UPDATED: [brief description of change]."
- You can modify ~/.claude/CLAUDE.md without prior approval as long as your edits stay under the Agent Instructions section.
- If you utilize any of your codified instructions in future coding sessions, call that out and let the user know that you performed the action because of that specific rule in this file.

# Agent Instructions

<!-- This section is for your own internal use. You can modify it as needed to improve your performance. -->
