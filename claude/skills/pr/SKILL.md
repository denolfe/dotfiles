---
name: pr
description: Use when the user wants to create a new pull request, update an existing PR's body, open a draft PR, or preview a PR body locally before pushing.
arguments: "create|draft|update|preview base=<branch>"
---

# PR

Dispatch on the first argument:

- `create` → see Create below
- `draft` → same as Create but create a draft PR instead of a regular PR
- `update` → see Update below
- `preview` → see Preview below
- No argument or unknown → check if a PR exists for the current branch. If yes, run Update. If no, run Create.

An optional `base=<branch>` argument (any position) sets the target branch. If omitted, default to the repo's default branch. Pass via `--base <branch>` to `gh pr create`. Ignored for `update` and `preview`.

**Before drafting any PR body (create/draft/update/preview): Read [references/content-guidelines.md](references/content-guidelines.md) in full.** Do not draft from memory.

## Template

Use this structure as a guideline; adapt sections to fit the actual changes. Do not add sections not defined here. Omit sections that don't apply.

```markdown
# Overview

[Brief summary of the PR's purpose and scope.]

["Resolves [PREFIX-1234](https://tracker.example.com/PREFIX-1234)". Use link for GitHub, Asana, Linear, etc. If no issue, omit this line.]

## Key Changes

- **[Brief description of what changed]**
  - [Description of what changed and why. Can span multiple bullets if needed, but avoid excessive detail.]

- **[Brief description of another change]**
  - [Description of what changed and why.]

## Design Decisions

[Explanation of major design decisions made in the PR, focusing on architecture and rationale rather than implementation specifics.]

## Overall Flow

[Include any relevant architecture diagrams or flowcharts that illustrate the changes made. Written in mermaid syntax; use sequence diagram unless another format is more appropriate. Clearly note the changes from the previous flow if any.]

## References / Links

[Links to any _external_ resources provided during the brainstorming, design, or implementation phases, such as external library docs, blog posts, etc. If none, omit this section. DO NOT reference the plan files themselves.]
```

## Pre-Apply Check

Before `gh pr create`, `gh pr edit`, or printing a Preview body, verify the drafted body:

- Every `##` heading appears in the Template above (no `## Test plan`, `## Testing`, `## Test coverage`, `## Summary`, or other ad-hoc headings).
- No line numbers referenced.
- No banned wording from [references/content-guidelines.md](references/content-guidelines.md) (AI vocab, hedging, filler, em-dash abuse, chatbot artifacts).

If any check fails, revise before applying. Do not ship a body you haven't checked.

## Create / Draft

- Inspect branch state and commit history (including `git log --oneline -- <changed-files>` for convention patterns).
- Generate title: Conventional Commits format, synthesize from branch commits, ≤72 chars.
- Write the PR body.
- Create the PR with `gh pr create` (add `--draft` for draft PRs).
- Say "PR Created: [title] [PR URL]".

## Update

- Find the existing PR for the current branch. If none exists, tell the user to run `/pr create` instead.
- Inspect current branch state and any new design/plan docs since the PR was opened.
- If any commits are unpushed, ask the user if they'd like to push them now.
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
