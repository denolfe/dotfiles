# Multi-agent skills: portable content, host-specific deployment

Research date: 2026-09-19. Sources are first-party specifications, documentation, and source repositories only.

## Bottom line

The emerging practice is **one standard skill directory, plus a deployment adapter that knows each host's discovery path**. It does *not* mean that every behavior in a `SKILL.md` is portable. Keep the shared body and standard frontmatter portable; put invocation controls, command/argument expansion, permissions, UI metadata, plugins/connectors, and discovery paths in host-specific integration.

## The portable unit

The [Agent Skills specification](https://agentskills.io/specification) defines a skill as a directory containing `SKILL.md`, with optional `scripts/`, `references/`, and `assets/`. Its required frontmatter is `name` and `description`; `name` must match the parent directory and obey a lowercase/hyphenated naming rule. The other standardized fields are `license`, `compatibility`, `metadata`, and experimental `allowed-tools`.

This is the safest shared contract:

```text
<skill-name>/
  SKILL.md                 # name + description, standard body
  scripts/                  # self-contained; document dependencies
  references/               # loaded only when relevant
  assets/
```

The spec explicitly says support for `allowed-tools` varies by agent, and that supported script languages depend on the host. Treat both as capability declarations, not portable behavior. [Specification: `allowed-tools`](https://agentskills.io/specification#allowed-tools-field), [Specification: scripts](https://agentskills.io/specification#scripts).

## What the implementations actually do

| Project | Content contract | Multi-agent deployment pattern | Implication |
| --- | --- | --- | --- |
| [Anthropic Claude Code](https://code.claude.com/docs/en/skills) | Follows Agent Skills, but adds Claude-only frontmatter, dynamic substitutions, and subagent execution. | Discovers personal/project skills in `.claude/skills` or `~/.claude/skills`. | Keep Claude-only frontmatter and `$ARGUMENTS` / `${CLAUDE_*}` substitutions out of a shared body. |
| [OpenAI Codex](https://learn.chatgpt.com/docs/build-skills) | A directory with required `name` and `description`, plus optional scripts/references/assets. | Scans `.agents/skills` from CWD to repo root and `$HOME/.agents/skills`; follows symlinked skill folders. | `.agents/skills` is a real shared discovery convention for Codex, but not a universal global path. |
| [Vercel Labs `skills`](https://github.com/vercel-labs/skills#readme) | `SKILL.md` with `name` and `description`. | Maintains a target matrix and installs to each host's native path. Its recommended mode makes agent directories symlink to a canonical copy; `--copy` is the fallback. | This is a concrete *canonical-store + bindings* model: content is shared, while target selection/path binding belongs to the installer. |
| [Microsoft APM](https://microsoft.github.io/apm/producer/author-primitives/skills/) | Uses the cross-tool Agent Skills format and copies the complete skill directory. | A manifest-selected target routes to `.agents/skills` for Codex/Copilot/Cursor/Gemini/OpenCode/Windsurf, but to `.claude/skills`, `.kiro/skills`, and `.grok/skills` for those hosts. | This is a concrete *source + generated per-host deployment* model; it rejects a single-path assumption. |

## Evidence that host extensions must stay separate

Claude says that, outside Claude Code, only the six Agent Skills specification fields are usable for its portable packaging/upload paths; Claude-only body features such as dynamic context injection do not carry over. [Claude's portability guidance](https://code.claude.com/docs/en/skills#using-skill-frontmatter-outside-claude-code). Claude also expands `$ARGUMENTS`, indexed/named arguments, and `${CLAUDE_*}` variables. [Claude substitutions](https://code.claude.com/docs/en/skills#available-string-substitutions).

Codex uses `agents/openai.yaml` for OpenAI-specific UI metadata, invocation policy, and dependencies. In particular, `policy.allow_implicit_invocation: false` is the documented way to suppress automatic invocation. [OpenAI skill configuration](https://learn.chatgpt.com/docs/build-skills#configure-a-skill). That file should be an OpenAI adapter, not a reason to add OpenAI-only frontmatter to a shared `SKILL.md`.

The standard itself reinforces the boundary: `allowed-tools` is experimental and host support may differ. [Agent Skills spec](https://agentskills.io/specification#allowed-tools-field). A shared skill therefore must not assume an approval/permission effect from it.

## Deployment patterns worth copying

### 1. Canonical store + links (Vercel `skills`)

Vercel's CLI installs a canonical copy and, in its recommended symlink mode, links each agent directory back to it; `--copy` produces independent copies. It exposes explicit `--agent`, `--global`, and `--copy` controls. [Installation methods](https://github.com/vercel-labs/skills#installation-methods), [targeted installation options](https://github.com/vercel-labs/skills#options). Its target table records different native paths, including `.claude/skills`, `.agents/skills` for Codex project installs, and `~/.codex/skills` for Codex global installs. [Supported-agent matrix](https://github.com/vercel-labs/skills#supported-agents).

This aligns with a dotfiles-managed canonical `~/.agents/skills` plus explicit host links, provided stale bindings are pruned by the deployment tool.

### 2. Source + generated target outputs (Microsoft APM)

APM treats `.apm/skills/` as authoring source and deploys the *same skill folder* to target-specific locations; the target is resolved by explicit flag, manifest target list, then filesystem detection, and APM errors instead of silently guessing when it cannot determine one. [APM deployment selection](https://microsoft.github.io/apm/getting-started/first-package/#4-deploy-and-use). Its routing table demonstrates convergence only where hosts actually share `.agents/skills`; Claude remains `.claude/skills`. [APM target routing](https://microsoft.github.io/apm/producer/author-primitives/skills/#where-it-lands-per-target).

APM also offers `--dry-run` to inspect the routing table before a deployment. [APM preview guidance](https://microsoft.github.io/apm/producer/author-primitives/skills/#preview-before-you-commit). That is a useful safety requirement for a home-grown linker.

## Recommendation for this dotfiles design

1. Make every shared skill comply strictly with the Agent Skills contract: explicit valid `name` equal to directory name; specific `description`; portable instructions; bundled resources by relative path.
2. Keep one canonical source/store, but maintain a **host mapping** rather than treating `~/.agents/skills` as universally discovered. Today: Codex can read `~/.agents/skills`; Claude needs a link/copy at `~/.claude/skills`; Pi and future hosts should be added only after their documented discovery path is verified.
3. Separate adapters from content: `agents/openai.yaml` for Codex/ChatGPT behavior; Claude-only invocation/arguments/substitutions in a Claude wrapper or clearly optional companion skill; no shared `allowed-tools` unless its per-host security effect has been reviewed.
4. Make deployment declarative and idempotent: enumerate desired bindings, preview/check them, create/update links or copies, and remove bindings that are no longer declared. Both Vercel and APM model the adapter as target-aware deployment rather than a search-path heuristic.
5. Test the portable contract separately from host integration: validate the directory/frontmatter once; then verify discovery, explicit invocation, implicit invocation policy, scripts, and permissions per host.

## Important caveat

Neither the standard nor these tools establishes a guaranteed "all future agents" runtime contract. They standardize the on-disk package and solve known-host routing; host-specific semantics remain a compatibility matrix that must be versioned and tested.
