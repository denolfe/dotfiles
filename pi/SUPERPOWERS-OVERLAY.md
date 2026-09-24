# Superpowers Pi Overlay

Local Superpowers skills follow upstream `obra/superpowers` as the source of truth.

## Upstream Baseline

- Upstream repo: `https://github.com/obra/superpowers`
- Upstream ref: `5bf4e78`
- Upstream tag: `v6.4.1`
- Local mirror root: `pi/skills/**`

## Local Customization Baseline Reviewed

- Fork repo: `https://github.com/denolfe/superpowers`
- Branch: `customized-5.2.8`
- Baseline fork is recorded in the reviewed row below.

## Overlay Policy

1. Copy upstream `skills/**` into `pi/skills/**` first.
2. Keep Pi harness behavior centralized in `pi/extensions/superpowers.ts` and `pi/skills/using-superpowers/references/pi-tools.md`.
3. Patch individual skill files only when the behavior is user-preference policy and upstream has not superseded it.
4. Document each retained patch in this file.
5. Do not restore prompt wrappers for `brainstorm`, `write-plan`, or `execute-plan`.

## Reviewed Custom Commits

| Commit | Original purpose | Decision | Rationale |
|---|---|---|---|
| `34ccb3a` | Add brainstorming hard gates for design approval and section review | Rewrite | Keep approval discipline, but port to current v6.4.1 brainstorming structure and Pi wording. |
| `538e935` | Save implementation plans to `3-PLAN.md` in task folder | Keep | This is a local workflow preference and supports stable design/plan folder structure. |
| `a1bef15` | Save brainstorming design docs to `2-DESIGN.md` in task folder | Keep | This pairs with `3-PLAN.md` and preserves the local task-folder workflow. |
| `d0633cd` | Execute plans in batches with review checkpoints | Drop | Upstream v6.4.1 rebuilt `executing-plans` as native inline execution with one final review; restoring checkpoints would fight upstream. |
| `adb8561` | Reference `2-DESIGN.md` in brainstorming handoff prompt | Keep | This follows from retaining `2-DESIGN.md`. |
| `c964d09` | Restore codebase-reading and design-doc logging customizations | Rewrite | Keep codebase-reading-before-questions and clarifying-question log; port to current v6.4.1 wording. |
| `7866d84` | Prevent treating tweaks/questions as approval | Keep | This is a live behavior guard and not present upstream. |
| `abf7326` | Stop mandating AskUserQuestion for section approval | Keep | Baseline fork `denolfe/superpowers@abf7326` on branch `customized-5.2.8`; Pi supports `ask_user_question`, but normal chat approval is often enough and avoids over-constraining the workflow. |
| `e552f48` | Name concrete subagent types in old SDD graph | Drop | Upstream v6.4.1 replaced the old two-reviewer SDD flow; Pi subagent mapping belongs in bootstrap/tool mapping. |
| `d579a9b` | Add squash-and-merge option to finishing branch skill | Keep | This is a local integration preference and is still useful after upstream's safer finishing-branch rewrite. |

## Customization Intent Ledger

Use this ledger during future upstream syncs. The goal is to preserve the user-facing intent of each customization, not necessarily the exact historical patch.

| Intent | Source commits | Current tracking signal | Re-apply if upstream loses... |
|---|---|---|---|
| Require explicit whole-design approval before implementation | `34ccb3a`, `7866d84` | `brainstorming/SKILL.md` requires an exact approving quote and rejects inferred approval from tweaks or Q&A | A hard stop before implementation unless the user explicitly approved the whole design |
| Keep brainstorming design artifacts in the task folder | `a1bef15`, `adb8561` | `brainstorming/SKILL.md` writes `2-DESIGN.md`; `writing-plans/SKILL.md` reads sibling `2-DESIGN.md` | The `2-DESIGN.md` artifact or handoff from design to plan |
| Preserve clarifying-question history in design docs | `c964d09` | `brainstorming/SKILL.md` includes a clarifying-question log template | A record of questions asked, selected answers, and alternatives considered |
| Read the codebase before asking avoidable questions | `c964d09` | `brainstorming/SKILL.md` starts each path with project-context exploration | The expectation that repo context should be inspected before asking questions the code can answer |
| Use conversational section approval, not mandatory UI prompts | `abf7326` | `brainstorming/SKILL.md` says to present sections as normal chat text | Freedom to use normal transcript approval instead of forcing `ask_user_question` for every section |
| Save implementation plans in the task folder | `538e935` | `writing-plans/SKILL.md` saves `3-PLAN.md` and `3-PLAN.md.tasks.json` | The stable `3-PLAN.md` / task JSON convention |
| Offer squash-and-merge as a finishing option | `d579a9b` | `finishing-a-development-branch/SKILL.md` includes Option 2, squash locally | A local squash merge path that preserves upstream's safety checks |
| Keep Pi-specific subagent/tool adaptation centralized | `e552f48` spirit only | `pi/extensions/superpowers.ts` and `using-superpowers/references/pi-tools.md` explain Pi tools | Concrete Pi guidance for tasks/subagents after upstream changes tool names or workflow text |
| Avoid restoring old batch-checkpoint execution flow unless needed | `d0633cd` intentionally dropped | `executing-plans` remains upstream v6.4.1 | Nothing by default; reintroduce only if upstream loses needed execution safety and the user asks for it |

## Expected Local Differences From Upstream

- `pi/extensions/superpowers.ts` contains Pi-specific bootstrap guidance.
- `pi/SUPERPOWERS-OVERLAY.md` exists only locally.
- Retained overlay edits may exist in:
  - `pi/skills/brainstorming/SKILL.md`
  - `pi/skills/writing-plans/SKILL.md`
  - `pi/skills/finishing-a-development-branch/SKILL.md`

## Future Update Procedure

1. Update `~/dev/reference-repos/superpowers` to the desired upstream ref.
2. Replace `pi/skills/**` from upstream.
3. Re-apply retained overlays listed above.
4. Build `pi/extensions/superpowers.ts`.
5. Run a drift check with `diff -ru pi/skills ~/dev/reference-repos/superpowers/skills` and confirm differences match this manifest.
6. Update this file with the new upstream ref and any changed overlay decisions.

## Last Verified

- Date: 2026-09-24
- Extension build: `bun build pi/extensions/superpowers.ts --outdir /tmp/pi-superpowers-check --target bun`
- Prompt wrapper check: no `brainstorm.md`, `write-plan.md`, or `execute-plan.md` under `pi/prompts`
- Expected drift files:
  - `pi/skills/brainstorming/SKILL.md`
  - `pi/skills/writing-plans/SKILL.md`
  - `pi/skills/finishing-a-development-branch/SKILL.md`
