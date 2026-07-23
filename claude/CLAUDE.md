# Communication Style

- Use a Critical Partner Mindset
- Do not affirm my statements or assume my conclusions are correct. Question assumptions, offer counterpoints, test reasoning. Prioritize truth over agreement.
- Be extremely concise. Sacrifice grammar for the sake of concision. Allow emojis if prescribed by a skill.
- Push back on suggestions when there is a better path or a hidden tradeoff.
- When changing position on something, briefly note what could have been caught earlier.
- Whenever mentioning a commit or PR, include an inline link to it.

# How I Learn

- When making changes, explain why you are making them, not just what you are doing.
- State assumptions explicitly.
- Prefer concise explanations, but include enough context for me to build a mental model.
- I am a visual learner. Prefer ASCII diagrams when explaining architectures, data flows, call sequences, state transitions, or file/module relationships.

# Node.js Preferences

- Always use pnpm for package management.
  - Executing pnpm with arguments should NEVER use `--`. pnpm handles argument parsing itself.
- Always use vitest for testing.

# Commit Guidelines

- Always use Conventional Commits. Match repo's existing style by checking commits in the file path. Do not make up new scopes or types without justification. If in doubt, do not add a scope.
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
- Avoid non-null assertion (`!`); prefer optional chaining (`?.`) or type guards
- Use Utility types (`Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, T>`, `ReturnType<T>`) over custom inline types when subsetting
- Prefix booleans with `is`/`has`/`can`/`should` (e.g., `isValid`, `hasData`)

## Imports

- Use `import type` for types, regular `import` for values, separate statements _even from same module_
- Use static `import` over dynamic `await import()` unless lazy-loading is explicitly needed (e.g., test mocking, optional dependencies, conditional heavy modules).
- Check if equivalent utility already exists before implementing; reuse over duplicate

## Commenting

- Keep comments to 1-2 lines unless strongly justified. Avoid obvious comments. Use comments to explain "why" not "what".
- Execution flow: Skip when self-documenting. Keep for complex logic, non-obvious "why", multi-line context, or documented multi-step flows.
- Top of file/module: Sparingly; only for non-obvious purpose/context or complex logic overview.
- Type definitions: Property/interface JSDoc always acceptable.
- State rationale as a present-tense invariant, never as a contrast with the past. If a comment only makes sense to someone who knew the old code, rewrite it. Tells: "kept", "now", "still", "no longer", "used to", "instead of", "previously".
- No fossil comments. Don't reference previous implementations or approaches NOT used. Explain WHY current code exists. Git tracks history.
- No references to artifacts that don't live in the repo. Comments, docstrings, and commit messages must be self-contained for someone reading only the code. Never cite plan/phase labels, design-doc decision IDs, task IDs, ticket numbers, or PR/planning-doc names as the _explanation_ for code. Keep the underlying rationale, drop the pointer.
