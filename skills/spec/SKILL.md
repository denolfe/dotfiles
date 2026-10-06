---
name: spec
description: Interview the user about a feature or change, then write the agreed design to a spec file. First step of spec -> slice -> build.
---

# Spec

Turn an idea into an agreed design. Write no code; that is `/build`'s job.

## Process

1. **Explore.** Read any task or research notes in the conversation or the spec folder, the relevant code, docs, `GLOSSARY.md` (or `GLOSSARY-MAP.md`), and ADRs in `docs/adr/`.
2. **Check scope.** If the request spans independent subsystems, propose a split and spec only the first. If settling the decisions needs more than one session, suggest `/wayfinder` instead.
3. **Propose approaches.** Sketch 2-3 whole approaches with trade-offs and recommend one. The user picks before any detail work. If purpose is unclear, ask first. Skip when only one reasonable approach exists.
4. **Grill** inside the chosen approach. Call the Skill tool with `grilling`. Cover purpose, constraints, success criteria, and what is out of scope. Scale to size: a one-file change gets one short round. When a decision depends on an outside fact (third-party API, library behavior), call `research` in the background, saving to the spec folder; only the questions that depend on it wait. If the design adds or changes domain terms, or makes a decision worth an ADR, also call `domain-modeling`.
5. **Shape interfaces.** If the design adds or changes something another file depends on (export, signature, shared type, CLI flag, route, config schema, error modes), call `codebase-design`, sketch 2-3 shapes, and recommend one. Agree the **test seams**: prefer existing seams, the highest one possible, as few as possible.
6. **Write the spec** only after the user confirms shared understanding, with the template below. Location, first match wins: a path the user gives; the task folder already in use this conversation (any existing design file there gets updated in place); else `~/.agents/plans/{YYYY-MM-DD}_{project}_{slug}/spec.md`.
7. **Self-check.** Fix inline: no placeholders, no contradictions between sections, every requirement reads only one way.
8. **Hand off.** Give the path, ask the user to review it, apply edits. On approval, say: "Next: `/slice`".

## Template

```markdown
# <Feature> Design

## Problem

<from the user's view>

## Solution

<from the user's view>

## Decisions

<modules touched or added; for each interface: what a caller must know (invariants, ordering, error modes); data flow; schema or contract changes>

- <decision>
  Rejected: <option> (<why>)

## Test Seams

<the agreed seams and what each test observes there; prior-art tests to copy>

## Out of Scope

## Open Questions

<must be empty before /slice>
```

## Rules

- No file paths, line numbers, or code. Exception: a snippet that pins a decision better than prose (type shape, schema, state machine).
- Short beats complete. A reader should finish it in two minutes.
- YAGNI: cut any feature the user did not ask for.
