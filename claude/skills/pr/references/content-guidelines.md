# PR Content Guidelines

Applies to both `create` and `update`.

## Structure

- Use the template in [../SKILL.md](../SKILL.md) _as a guideline_ for structuring the PR description; adapt sections to fit the actual changes.
- DO NOT add sections that are not defined in the template.
- DO NOT include anything related to test plan or test coverage.
- DO NOT reference specific line numbers.
- Focus on architecture and high-level decisions over implementation details.
- Reference design/plan documents or branch commits for deeper context instead of inlining details.

## Wording Rules

- No AI vocabulary: avoid "leverage", "enhance", "crucial", "pivotal", "comprehensive", "streamline", "robust", "seamless", "facilitate", "utilize" — use plain equivalents
- No significance inflation: don't puff up changes with "key", "vital", "critical", "fundamental" — just describe what changed
- No filler: cut "in order to" → "to", "it is important to note that" → (delete), "due to the fact that" → "because"
- No hedging: avoid "potentially", "might possibly", "it could be argued" — state facts directly
- No -ing padding: don't append "ensuring consistency", "highlighting the need for", "improving maintainability" as filler justifications - if the reason matters, give it its own sentence
- No copula avoidance: use "is/are/has" instead of "serves as", "stands as", "acts as"
- No negative parallelisms: avoid "not only X but also Y", "it's not just X, it's Y"
- No rule of three: don't force triads like "faster, safer, and more maintainable" — include only what's true and relevant
- No em dash abuse: prefer commas, parentheses, or separate sentences
- No chatbot artifacts: no "Let me know if...", "Here's an overview of...", "This PR aims to..."
- No references to mermaid node IDs or branch labels (e.g., "the D -- No branch"). These don't render outside the diagram. Describe the flow in plain language instead.
