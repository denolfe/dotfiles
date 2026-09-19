---
name: search
description: Search the web with parallel queries for comprehensive results
argument-hint: <topic or question>
disable-model-invocation: true
---

# Search

The topic is whatever the user passed when invoking this skill.

If no arguments were provided, use the current context to determine what to search for. If the context is insufficient, ask the user for clarification.

## Step 1: Generate Queries

Generate 2-4 queries based on complexity:
- **Simple** (specific question): 2 queries
- **Moderate** (comparison, how-to): 3 queries
- **Complex** (broad topic, multiple angles): 4 queries

Query strategies:
- Rephrase with synonyms
- Add current year for recent info
- Target different aspects of the question

## Step 2: Execute in Parallel

State queries clearly:

```
Searching:
- [query 1]
- [query 2]
```

Issue all queries in a single response, not sequentially.

## Step 3: Synthesize

- Lead with direct answer
- Note any conflicting information between sources
- If results are insufficient, state what's missing and offer to search again with refined queries

## Step 4: Sources

End with markdown hyperlinks to sources that contributed to the answer:

```
Sources:
- [Title](url)
```

Categorize under subheadings if multiple source types were used.
