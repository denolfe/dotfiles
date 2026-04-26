---
name: pr
description: Use when the user wants to create a new pull request, update an existing PR's body, open a draft PR, or preview a PR body locally before pushing.
arguments: "create | draft | update | preview"
---

# PR

Dispatch on the first argument:

- `create` → see Create below
- `draft` → same as Create but create a draft PR instead of a regular PR
- `update` → see Update below
- `preview` → see Preview below
- No argument or unknown → check if a PR exists for the current branch. If yes, run Update. If no, run Create.

All subcommands follow [references/content-guidelines.md](references/content-guidelines.md) and use [assets/template.md](assets/template.md).

## Create / Draft

- Inspect branch state and commit history (including `git log --oneline -- <changed-files>` for convention patterns).
- Generate title: Conventional Commits format, synthesize from branch commits, ≤72 chars.
- Write the PR body.
- Create the PR with `gh pr create` (add `--draft` for draft PRs).
- Say "PR Created: [title] [PR URL]".

## Update

- Find the existing PR for the current branch. If none exists, tell the user to run `/pr create` instead.
- Inspect current branch state and any new design/plan docs since the PR was opened.
- Regenerate the PR body. Preserve existing intent where still accurate; revise drifted sections.
- Apply the new body.
- Show a diff of the old vs new body, highlighting changes.
- Say "PR Updated: [PR URL]".

Scope: body only. Do not change title or draft state unless the user asks. Do not push new commits.

## Preview

Generate the PR body and print it inline without creating, updating, or pushing anything.

- Inspect branch state (same as Create).
- Output the PR body inline in the response, inside a fenced ```markdown block so it's easy to copy.
- Do NOT write to any file.
- Do NOT run `gh pr create`, `gh pr edit`, `git push`, or any remote-mutating command.
