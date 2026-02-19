# denolfe's dotfiles

[![Actions Status](https://github.com/denolfe/dotfiles/workflows/Dotfiles%20Install/badge.svg)](https://github.com/denolfe/dotfiles/actions)
[![Powered by dotbot][dbshield]][dblink]

[dblink]: https://github.com/anishathalye/dotbot
[dbshield]: https://img.shields.io/badge/powered%20by-dotbot-blue?style=flat

> Personal dotfiles configuration

![Image](preview.png)

| Component                                | Tool                                                          | Config                                                                    |
| ---------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Installation                             | [Dotbot](https://github.com/anishathalye/dotbot)              | [install.conf.yaml](./install.conf.yaml)                                  |
| Terminal                                 | [Ghostty](https://ghostty.org)                                | [config](./ghostty/config)                                                |
| Prompt                                   | [Powerlevel10k](https://github.com/romkatv/powerlevel10k)     | [customizations](./zsh/p10k.customizations.zsh), [config](./zsh/p10k.zsh) |
| .zshrc                                   | [oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh)        | [.zshrc](./zsh/zshrc.zsh)                                                 |
| Global Key Rebinds, Hyper Key, App Focus | [Karabiner](https://karabiner-elements.pqrs.org/)             | [karabiner.ts](./karabiner/karabiner.ts)                                  |
| AI Coding Assistant                      | [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | [claude/](./claude/)                                                      |

## [Makefile](./Makefile)

- Install with dotbot
- Homebrew save/restore
- VS Code extension save/restore
- Karabiner config compilation
- Install MacOS defaults

## [Claude Code](./claude/)

### [CLAUDE.md](./claude/CLAUDE.md)

- **Critical partner mindset** - Question assumptions, prioritize truth over agreement, be extremely concise
- **Superpowers plan workflow** - Plans in `~/.claude/plans/{timestamp}-{issue-number}-{task-name}/` (`1-TASK.md`, `2-DESIGN.md`, `3-PLAN.md`)
- **TypeScript patterns** - Single object params, types over interfaces, functions over classes, pure functions
- **Bash permission matching** - Never use `git -C`, always `cd /path && git <cmd>`

### Statusline

- Directory, git branch, PR#, staged/modified/untracked counts, model name, context % gradient bar

<img src="statusline.png" alt="Statusline" width="600"/>

### Slash Commands

| Command           | Description                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| `/task`           | Create task folder with `1-TASK.md`, option to brainstorm `2-DESIGN.md`  |
| `/implement-plan` | Execute `PLAN.md` with subagent-driven dev and code review between tasks |
| `/create-pr`      | Create PR from template, architecture-focused with mermaid diagrams      |

### Plugins

**External** (via `set-defaults.sh`):
- **superpowers** - Skills for brainstorming, TDD, debugging, code review workflows
- **payload** - Payload CMS development helpers
- **typescript-lsp** - TypeScript language server integration

**[Local](./claude/local-plugins/)**

| Plugin                                                     | Purpose                                                        |
| ---------------------------------------------------------- | -------------------------------------------------------------- |
| [git-guardrails](./claude/local-plugins/git-guardrails/)   | Blocks `git add -A/.`, prompts for `--amend` and `--no-verify` |
| [sounds](./claude/local-plugins/sounds/)                   | Audio notifications (PermissionRequest, Stop)                  |
| [zellij-activity](./claude/local-plugins/zellij-activity/) | Zellij tab status updates (6 events)                           |

### Skills

| Skill               | Description                                            |
| ------------------- | ------------------------------------------------------ |
| ghostty-config      | Configure Ghostty terminal, lookup settings and themes |
| zellij              | Read from and write to other zellij panes              |
| markdown-formatting | Format/lint markdown files with markdownlint           |

### Spinner Verbs

Custom spinner verb themes (`make claude-verbs THEME=scifi`):
- **scifi** - "Beaming up", "Jumping to lightspeed", "Quantum leaping"...
- **peanut** - Peanuts-themed verbs

## Keyboard Mappings

### Hyper Key modifier

- <kbd>CapsLock</kbd>
- <kbd>CapsLock</kbd>+<kbd>cmd</kbd>

### Directional Bindings (<kbd>CapsLock</kbd>) w/ Selection (<kbd>CapsLock</kbd>+<kbd>cmd</kbd>)

- <kbd>h</kbd><kbd>j</kbd><kbd>k</kbd><kbd>l</kbd> - VIM arrows
- <kbd>m</kbd> - Left one word
- <kbd>.</kbd> - Right one word
- <kbd>n</kbd> - Home
- <kbd>p</kbd> - End
- <kbd>i</kbd> - Page Up
- <kbd>u</kbd> - Page Down
- <kbd>cmd</kbd>+<kbd>i</kbd> - Top of page
- <kbd>cmd</kbd>+<kbd>u</kbd> - End of page

### Remappings

- <kbd>CapsLock</kbd>+<kbd>delete</kbd> - Forward delete
- <kbd>CapsLock</kbd>+<kbd>cmd</kbd>+<kbd>delete</kbd> - Forward delete word
- <kbd>CapsLock</kbd>+<kbd>a</kbd> - Spaces left
- <kbd>CapsLock</kbd>+<kbd>d</kbd> - Spaces right
- <kbd>CapsLock</kbd>+<kbd>s</kbd> - Mission Control
- <kbd>CapsLock</kbd> +<kbd>cmd</kbd>+<kbd>s</kbd> - Show all app windows

### Window Launch or Focus

- <kbd>CapsLock</kbd>+<kbd>g</kbd> - Google Chrome
- <kbd>CapsLock</kbd>+<kbd>c</kbd> - Visual Studio Code
- <kbd>CapsLock</kbd>+<kbd>;</kbd> - Ghostty
- <kbd>CapsLock</kbd>+<kbd>f</kbd> - Slack
- <kbd>CapsLock</kbd>+<kbd>v</kbd> - Spotify
- <kbd>CapsLock</kbd>+<kbd>r</kbd> - Notion

### Window Manager

_Migrated to [Raycast Window Manager](https://www.raycast.com/core-features/window-management)_

## Usage

_Prerequisites: python, git, zsh_

### Installation

```sh
git clone git@github.com:denolfe/dotfiles.git .dotfiles --recursive
cd .dotfiles
make install
```

### Other Tasks

_[See Makefile](./Makefile)_
