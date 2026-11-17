# Codex local plugins

From the dotfiles root, install or refresh all declared plugins
(requires Codex CLI and `jq`):

```sh
make codex-plugins
```

Start a new Codex session and open `/hooks` to review and trust the installed hook.
After editing the plugin, run the same command again and review changes
in `/hooks`.

`make ai-install` includes this step alongside the Claude and shared skills setup.
The script resolves the marketplace from its own location, so it also works from
another checkout path without a symlink. Codex maintains its own configuration
and plugin cache. Add plugins to `.agents/plugins/marketplace.json` in this
directory to include them on the next run.

## Git guardrails

Ported from the current working copy of `claude/local-plugins/git-guardrails`.
Runtime: Bash and jq; no package installation or MCP server required.

| Command | Behavior |
| --- | --- |
| `git add -A`, `--all`, `.` | Deny; request explicit paths |
| `git -C`, `--git-dir`, `--work-tree` | Deny; request running from the repository root |
| `git commit --no-verify` | Deny; use normal checks or execute manually |
| Commit message using `-m "$(cat <<...)"` | Rewrite to `-F -` with stdin heredoc |
| Multiline commit attribution | Remove lines containing `Co-Authored-By:` or `Generated with` |
| `git push` | Pass through, matching the source hook's disabled push rule |

## Codex differences

Codex maps shell execution to `Bash` and `tool_input.command`. The existing deny
and rewrite protocol works; `ask` is unsupported and lets execution continue after
an error. This port denies `--no-verify` instead. Rewrites retain other input fields.
See the [official hook contract](https://learn.chatgpt.com/docs/hooks).

This package uses a root manifest and a local marketplace. See
[plugin packaging](https://developers.openai.com/plugins/build/plugins).

## Scope

The inherited regex rules cover ordinary commands, not arbitrary shell programs.
Aliases, dynamically constructed commands, scripts, and input sent to an existing
interactive shell can bypass them. Quoted text can also match. Commit cleanup
only inspects the command text; it does not read messages supplied through files
or editors. These are workflow preferences, not a security boundary.

## Verification

From the dotfiles root:

```sh
bash codex/update-local-plugins.test.sh
bash codex/local-plugins/git-guardrails/scripts/git-guardrails.test.sh
shellcheck codex/*.sh codex/local-plugins/git-guardrails/scripts/*.sh
markdownlint codex/local-plugins/README.md
```
