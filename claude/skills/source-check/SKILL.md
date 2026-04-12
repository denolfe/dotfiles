---
name: source-check
description: Use to fetch current documentation for technical topics like APIs, libraries, or tools mentioned in conversation.
disable-model-invocation: true
---

# Source Check

Fetch current documentation for technical topics in context.

## Invocation

- `/source-check` — fetch docs for technical topics in recent conversation
- `/source-check [topic]` — fetch docs for a specific topic

## Scope

Fetch current info for:
- Libraries and frameworks in use
- APIs and their current behavior
- Tools, CLIs, and their options
- Version-specific features or changes

Skip: conceptual discussions, architecture questions, opinion-based topics.

## Pipeline

### Step 1: Identify Topics

Scan recent conversation for technical topics that would benefit from current documentation. Prioritize:
1. Libraries/frameworks being discussed
2. APIs or methods in use
3. Tools, CLIs, configuration options
4. Version-specific behavior

List each topic as a brief phrase.

### Step 2: Fetch via Subagent

Dispatch a general-purpose subagent with:

```
Fetch current documentation for these technical topics:

1. [topic 1]
2. [topic 2]
...

For each topic:
1. Generate 1-2 targeted search queries (include library name, version if relevant)
2. Use WebSearch to find current docs (prefer official docs, changelogs, release notes)
3. If needed, use WebFetch on official docs URL for details
4. Summarize current state/behavior

Return ONLY this format:

## Current Documentation

### [Topic 1]
[Current state/behavior summary - 2-3 sentences]

Source: [Official Docs](url)

### [Topic 2]
[Current state/behavior summary - 2-3 sentences]

Source: [Changelog](url)

If a topic has changed recently, note what changed.
```

### Step 3: Integrate

Present subagent results. Use fetched documentation to inform subsequent responses.

## Output Format

```markdown
## Current Documentation

### [Topic]
[Current state/behavior summary]

Source: [Source Name](url)

### Notable Changes
- [Recent change if relevant]
```

Omit Notable Changes if nothing recent.

If no technical topics found:
> No technical topics identified in recent context.

## Examples

**Single topic:**

### React useEffect
Runs after render by default. Cleanup function runs before next effect and on unmount. Dependencies array controls when effect re-runs.

Source: [React Docs](https://react.dev/reference/react/useEffect)

**Multiple topics with changes:**

### Node.js 20 ESM Support
Native ESM fully supported. Use `"type": "module"` in package.json or `.mjs` extension. `require()` still works in CommonJS files.

Source: [Node.js Docs](https://nodejs.org/api/esm.html)

### Notable Changes
- Node 20 added `require()` of ESM modules behind flag (--experimental-require-module)

## After Output

Resume normal conversation. Use fetched documentation to inform subsequent responses.
