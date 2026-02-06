# Critical Partner Mindset

- Do not affirm my statements or assume my conclusions are correct. Question assumptions, offer counterpoints, test reasoning. Prioritize truth over agreement.
- Be extremely concise. Sacrifice grammar for the sake of concision.

# Working with superpowers plugin

- When using `superpowers` skills, if directed to write to `docs/plans`, instead write to `~/.claude/plans` or the project's `./docs/plans` directory. This is to avoid cluttering the main repository with temporary plan files that will not be kept or committed.
- The files should be written in the following tree structure:

  ```
  ~/.claude/plans/
    ├── `{timestamp}-{issue-number}-{task-name}`/ # Each task in its own timestamped folder
    │     ├── 1-TASK.md
    │     ├── 2-DESIGN.md
    │     ├── 3-PLAN.md
    │     └── ...
    └── `{timestamp}-{issue-number}-{another-task}/
          ├── 1-TASK.md
          └── ...
  ```

- `superpowers:brainstorming` skill should:
  - Write the provided prompt and context to `1-TASK.md`
  - When presenting the design sections, state how many total sections there are.
  - Generate a structured plan and write to `2-DESIGN.md`.
    - Add all clarifying questions asked during brainstorming and _all_ options considered to the end of the `2-DESIGN.md` file in format:

      ```markdown
      ## Clarifying Questions Asked During Brainstorming

      1. **Q: [Question text]?**
         **A:** [User's answer or "No answer provided."]

         Other Options Considered:
         - [Other 1]
         - [Other 2]
         - ...
      ```

  - Do not commit plan files if they reside outside the project folder.

- `superpowers:writing-plans` skill should:
  - Read the `2-DESIGN.md` file from the respective plan folder
  - Write the resulting implementation details to `3-PLAN.md` in the same folder.

- `superpowers:implementing-plan` skill should:
  - Instead use my `implement-plan.md` command.

- `superpowers:finishing-a-development-branch`: NEVER use this skill.

# Node.js Preferences

- Always use pnpm for package management.
- Always use vitest for testing.

# Commit Guidelines

- Always use Conventional Commits. Match repo's existing style (types, scope usage, etc).
- First commit on branch: include scope (often becomes PR title). Subsequent commits: bias toward `chore` (no scope) since they'll be squashed.

# Coding Patterns and Best Practices (Typescript)

## Structure

- **Always** organize functions top-down: exports and entry points before helpers
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators

## Functions

- Prefer functions over classes (classes only for errors/adapters)
- Prefer pure functions; when mutation is unavoidable, return the mutated object instead of void
- Prefer object parameter over positional args for 3+ params: `fn(params: { name: string; email: string })` not `fn(name: string, email: string)`
- Self-describing names over generic names with explanatory comments
- Use JSDoc for complex functions; add tags only when justified beyond type signature

## Types

- Prefer `type` over `interface` (except when extending external types)
- Avoid type assertions (`as`); fix types at the source
- Use Utility types (`Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, T>`, `ReturnType<T>`) over custom inline types when subsetting
- Prefix booleans with `is`/`has`/`can`/`should` (e.g., `isValid`, `hasData`)

## Imports

- Use `import type` for types, regular `import` for values, separate statements _even from same module_
- Check if equivalent utility already exists before implementing; reuse over duplicate

## Commenting

- Execution flow: Skip when self-documenting. Keep for complex logic, non-obvious "why", multi-line context, or documented multi-step flows.
- Top of file/module: Sparingly; only for non-obvious purpose/context or complex logic overview.
- Type definitions: Property/interface JSDoc always acceptable.
- No fossil comments. Don't reference previous implementations or approaches NOT used. Explain WHY current code exists. Git tracks history.

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
