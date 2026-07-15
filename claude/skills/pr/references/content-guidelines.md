# PR Content Guidelines

Applies to both `create` and `update`.

## Structure

- Assemble the PR description from the block library in [blocks.md](blocks.md); it is the source of truth for allowed sections (Overview, Motivation, Usage, Resolves link, Key Changes, Design Decisions, Root Cause, Overall Flow, References / Links).
- DO NOT add sections that are not in the block library.
- DO NOT include anything related to test plan or test coverage.
- DO NOT reference specific line numbers.
- Focus on architecture and high-level decisions over implementation details.
- Reference design/plan documents or branch commits for deeper context instead of inlining details.

## Wording Rules

**REQUIRED SUB-SKILL:** Invoke the `humanizer` skill and apply it to the drafted body. It is the source of truth for general prose anti-patterns (AI vocabulary, significance inflation, filler, hedging, `-ing` padding, copula avoidance, negative parallelisms, rule of three). Do not re-derive the list from memory.

The rules below are PR-specific emphases and overrides, not a replacement:

- No em dashes anywhere: use commas, colons, parentheses, or separate sentences. This is an absolute ban, stronger than the humanizer's "avoid overuse": it applies in prose AND in list/link separators (write `[label](url): description`, not `[label](url) — description`)
- No chatbot artifacts: no "Let me know if...", "Here's an overview of...", "This PR aims to..."
- No references to mermaid node IDs or branch labels (e.g., "the D -- No branch"). These don't render outside the diagram. Describe the flow in plain language instead.

## Sentence Structure

Wording rules govern words; these govern sentence shape. Density (not word choice) is what makes a body hard to read. Applies to every block's prose.

**Cut extraneous load, keep intrinsic load** (Cognitive Load Theory). Keep the content: CS terms, caveats, fidelity. Strip the packaging: clause chains and mechanism-first ordering. Two techniques:

- **Chunking (one idea per sentence).** Do not chain *what changed* + *mechanism* + *consequence* with `which` / `so` / `and`. State each as its own sentence. Prefer several short sentences over one packed one, even at more lines: reads-faster beats fits-in-fewer-lines.
- **BLUF (bottom line up front).** Lead with the change. Mechanism and consequence follow as their own sentences, never as trailing clauses.

Per-block length caps (e.g. Key Changes sub-bullets) live with those blocks in [blocks.md](blocks.md).

Example:

```
Bad (one packed sentence):
  A registry pre-check skips packages already published, and an
  authoritative already-published error from npm counts as success, so
  re-running finishes a partial publish safely.

Good (one idea per sentence):
  A registry pre-check skips already-published packages. npm's
  already-published error also counts as success. Together these make a
  re-run safe on a partial publish.
```
