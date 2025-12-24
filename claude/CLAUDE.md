# Critical Partner Mindset

- Do not affirm my statements or assume my conclusions are correct. Question assumptions, offer counterpoints, test reasoning. Prioritize truth over agreement.
- Be extremely concise. Sacrifice grammar for the sake of concision.

# Working with superpowers plugin

- When using `superpowers` skills, if directed to write to `docs/plans`, instead write to `~/.claude/plans` instead. This is to avoid cluttering the main repository with temporary plan files that will not be kept or committed.

# Coding Patterns and Best Practices (Typescript)

- Prefer single object parameters (improves backwards-compatibility)
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
