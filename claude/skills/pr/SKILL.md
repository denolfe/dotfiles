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

**Before drafting any PR body (create/draft/update/preview): Read [references/content-guidelines.md](references/content-guidelines.md) AND [references/blocks.md](references/blocks.md) in full.** Do not draft from memory.

## Classify

Run this first, before selecting blocks. Classify the change on two axes:

- **TYPE (fix vs feature)** — infer from Conventional Commit prefixes on the branch commits plus diff shape. `fix:`/`revert:` lean fix; `feat:` leans feature.
- **COMPLEXITY (simple vs complex)** — infer from files touched, diff size, and whether new architecture or a changed control/data flow is introduced.

Then:

1. State the result in one line, e.g. `Detected: feature + complex`.
2. Ask the user ONLY when signals conflict: mixed `fix`/`feat` commits, or a diff on the simple/complex borderline. Otherwise proceed.

## Template

The body is assembled from the block library, not a single fixed template.

1. Take the classification's quadrant and pick the matching **profile** in [references/blocks.md](references/blocks.md).
2. Add or drop the profile's `○` blocks using the **include-when rules** there.
3. Emit blocks in the order listed in the block library.

Do not add sections outside the block library. Keep all language succinct and concise.

## Pre-Apply Check

Before `gh pr create`, `gh pr edit`, or printing a Preview body, verify the drafted body:

- Every `##` heading appears in the block library in [references/blocks.md](references/blocks.md) (no `## Test plan`, `## Testing`, `## Test coverage`, `## Summary`, or other ad-hoc headings).
- No line numbers referenced.
- No banned wording from [references/content-guidelines.md](references/content-guidelines.md) (AI vocab, hedging, filler, chatbot artifacts).
- Sentence structure (per [references/content-guidelines.md](references/content-guidelines.md)): scan all prose. Flag any sentence that chains *what changed* + *mechanism* + *consequence* with `which`/`so`/`and`, or leads with mechanism instead of the change. Split flagged sentences into what-then-why. Additionally, Key Changes sub-bullets over ~2 sentences / ~25 words (the cap in [references/blocks.md](references/blocks.md)) split into two bullets.
- Jargon (per [references/content-guidelines.md](references/content-guidelines.md) "Glossing Jargon"): every term of art carries a one-clause appositive gloss at first use. Flag any glossed term expanded into a worked example (cut to the gloss) or re-taught on a later mention.
- No em dashes (`—`) anywhere in the body, including link/label separators. Grep the drafted body for `—`; if any appear, replace with a colon, comma, parentheses, or separate sentence before applying.

If any check fails, revise before applying. Do not ship a body you haven't checked.

## Applying the Body

For `gh pr create` and `gh pr edit`, always use `--body-file` with `mktemp`. Never `--body` (its subshell mangles backticks and `$`). No exceptions — inconsistency invites the next agent to rationalize their way back to `--body`.

```bash
tmp=$(mktemp -t pr-body.XXXXXX) && trap 'rm -f "$tmp"' EXIT && cat > "$tmp" <<'EOF' && gh pr create --body-file "$tmp" [flags]
[body]
EOF
```

Run in a single Bash call — the `trap` only protects the shell it's set in.

## Create / Draft

- Inspect branch state and commit history (including `git log --oneline -- <changed-files>` for convention patterns).
- Generate title
  - Conventional Commits: `<type>(<scope>)?<!>?: <title>`. Title starts lowercase. No trailing period. Omit scope when no single area dominates.
  - Synthesize from branch commits
  - ≤72 chars
  - Should describe the change, not the symptom or task.
- Run **Classify** above, then write the PR body per **Template** (profile + include-when rules).
- Create the PR per **Applying the Body** above (add `--draft` for draft PRs).
- Say "PR Created: [title] [PR URL]".

## Update

<HARD-GATE>
STOP before any `gh pr edit` call.
Run `git status -b --porcelain=v2` (or check ahead/behind from `git status`).
If the branch is ahead of origin by ≥1 commit, you MUST call AskUserQuestion:
  "Branch is N commits ahead of origin. Push before updating the PR body?"
  - Yes, push then update body
  - No, update body only (description may reference commits not yet on remote)
This is a correctness gate, not etiquette: if you skip it, the body will describe commits the reviewer can't see. Skipping is a violation even if the user previously approved unrelated unpushed commits.
</HARD-GATE>

Steps:

1. Find the existing PR for the current branch. If none exists, tell the user to run `/pr create` instead.
2. Run the HARD-GATE check above. Resolve before continuing.
3. Inspect current branch state and any new design/plan docs since the PR was opened.
4. Run **Classify** above, then regenerate the PR body per **Template** (profile + include-when rules). Preserve existing intent where still accurate; revise drifted sections.
5. Apply the new body via `gh pr edit` per **Applying the Body** above.
6. Show a diff of the old vs new body, highlighting changes.
7. Say "PR Updated: [PR URL]".

Scope: body only. Do not change title or draft state unless the user asks.

### Red flags (rationalizations to reject)

| Thought | Reality |
|---------|---------|
| "The body update is the main action, push is incidental" | Push is a precondition. The body is meaningless if the commits aren't visible to reviewers. |
| "User said `/pr update`, not `/pr update and push`" | The skill defines update as inclusive of the push question. Asking is in scope. |
| "I can mention pushing in my closing summary" | Too late. The PR is already updated against stale remote state. |

## Preview

Generate the PR body and print it inline without creating, updating, or pushing anything.

- Inspect branch state (same as Create).
- Print a **preview summary** first, then the body. The summary is a fixed set of key/value lines so it's scannable, not prose:

  ```
  **Title:**    <generated title>
  **Detected:** <type> + <complexity>
  **Blocks:**   <comma-separated blocks included, in emit order>
  **Dropped:**  <comma-separated ○ blocks omitted + one-word reason each, or "none">
  **Status:**   Preview only: nothing created or pushed
  ```

- After the summary, output the PR body.
- Close with a one-line next step, e.g. "Run `/pr create` to open it."
- Do NOT write to any file.
- Do NOT run `gh pr create`, `gh pr edit`, `git push`, or any remote-mutating command.
