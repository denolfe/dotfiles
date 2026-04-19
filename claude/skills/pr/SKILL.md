---
name: pr
description: Use when the user wants to create a new pull request, update an existing PR's body, or open a draft PR for the current branch.
---

# PR

Dispatch on the first argument:

- `create` (optionally `create draft`) → see Create below
- `update` → see Update below
- No argument or unknown → check if a PR exists for the current branch. If yes, run Update. If no, run Create.

Both subcommands follow [references/content-guidelines.md](references/content-guidelines.md) and use [assets/template.md](assets/template.md).

## Create

- Inspect branch state.
- Write the PR body.
- Create the PR (draft if "draft" was specified).
- Say "PR Created: [PR URL]".

## Update

- Find the existing PR for the current branch. If none exists, tell the user to run `/pr create` instead.
- Inspect current branch state and any new design/plan docs since the PR was opened.
- Regenerate the PR body. Preserve existing intent where still accurate; revise drifted sections.
- Apply the new body.
- Say "PR Updated: [PR URL]".

Scope: body only. Do not change title or draft state unless the user asks. Do not push new commits.
