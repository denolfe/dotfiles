# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Personal dotfiles configuration using [Dotbot](https://github.com/anishathalye/dotbot) for installation and symlink management. Configures macOS development environment with terminal, shell, keyboard remappings, window management, and editor settings.

## Build & Development Commands

### Installation
```bash
make install          # Run dotbot install script (./install)
make link            # Run dotbot link only (./install --only link)
```

### Karabiner (Keyboard Remapping)
```bash
make karabiner       # Build karabiner.json from TypeScript
make karabiner-dev   # Watch mode with auto-rebuild
# Direct: deno run --allow-env --allow-read --allow-write karabiner/karabiner.ts
```

### Phoenix (Window Manager)
```bash
make phoenix         # Build ~/.phoenix.js from TypeScript
make phoenix-dev     # Watch mode with auto-rebuild
# Direct: pnpm -C phoenix run build
```

### VS Code Extensions
```bash
make vscode-install  # Install extensions from vscode/extensions.txt
make vscode-save     # Save current extensions to extensions.txt
```

### Homebrew
```bash
make brew           # Save Brewfile snapshot + cleanup
make brew-restore   # Install Homebrew and restore from Brewfile
```

### System Configuration
```bash
make macos          # Apply macOS defaults from macos/set-defaults.sh
make claude         # Apply Claude Code defaults from claude/set-defaults.sh
```

## Architecture

### Karabiner Configuration (`karabiner/`)
TypeScript-based Karabiner-Elements config using Deno and [deno_karabiner](https://github.com/esamattis/deno_karabiner).

**Key files:**
- `karabiner.ts`: Main config, builds JSON
- `lib/hyper.ts`: Hyper key helpers (`hyper()`, `hyperCmd()`, `hyperFocusApp()`)
- `lib/conditions.ts`: App-based conditions
- `lib/apps.ts`: Application mappings
- `lib/remap.ts`: Basic key remapping utilities

**Hyper key setup:**
- CapsLock → `left_shift + left_control + left_option`
- CapsLock alone → Escape
- CapsLock+Cmd → `left_shift + left_control + left_option + left_command`

**Architecture pattern:** Export rule builders from `lib/`, compose in main `karabiner.ts` using `KarabinerComplexModifications` class.

### Phoenix Configuration (deprecated) (`phoenix/`)
TypeScript window manager config compiled with `@vercel/ncc` to single-file `~/.phoenix.js`.

**Key files:**
- `src/phoenix.ts`: Main config with all keybindings
- `src/window-grid.ts`: Window positioning system (GridPosition 0-1 based)
- `src/window-cache.ts`: Window history tracking
- `src/screen.ts`: Multi-display management
- `src/hyper.ts`: Key binding helpers matching Karabiner's hyper key
- `src/utils/yabai.ts`: Yabai integration helpers

**Grid system:** All window positions defined as `GridPosition` with x/y/w/h on 0-1 scale. Supports split layouts (left66, right50, etc.) and centered positions (full, big, med, sm, xs).

**Binding pattern:**
```typescript
hyper('key', callback)      // CapsLock+key
hyperCmd('key', callback)   // CapsLock+Cmd+key
```

### ZSH Configuration (`zsh/`)
**Main file:** `zshrc.zsh` (symlinked to `~/.zshrc`)

Uses [zgenom](https://github.com/jandamm/zgenom) plugin manager with:
- oh-my-zsh base + plugins
- [Powerlevel10k](https://github.com/romkatv/powerlevel10k) theme
- Custom config: `p10k.customizations.zsh`
- Aliases: `../aliases/*.aliases.sh` (sourced from `$DOTFILES/aliases`)
- Functions: `../functions/*.sh` (sourced from `$DOTFILES/functions`)

**Loading order:** zgenom plugins → p10k theme → customizations → aliases → functions

### Shell Aliases & Functions
**Aliases** (`aliases/`): Organized by tool (git, node, zsh, claude, vim)

**Functions** (`functions/`): fzf-based utilities, git helpers, Claude commands
- `git.functions.sh`: Git workflow helpers
- `claude.functions.sh`: Claude Code integration
- `fpr.sh`, `fyr.sh`: fzf PR/year selectors
- `gl.sh`: Enhanced git log

### Dotbot Installation (`install.conf.yaml`)
Dotbot handles:
1. Submodule init
2. Homebrew setup via `macos/setup-homebrew.sh`
3. vim-plug download
4. Symlink creation (supports glob patterns, platform conditionals)
5. asdf plugin installation
6. Git config via `git/set-gitconfig.sh`

**Symlink pattern:** Uses `path:` for single files, `glob: true` for directories. `force: true` overwrites existing.

### macOS Defaults (`macos/set-defaults.sh`)
Bash script setting macOS preferences via `defaults write`. Categories:
- System (show hidden folders, keyboard backlight)
- Keyboard/Mouse (key repeat, smart quotes off, tap-to-click)
- Finder
- Dock
- Safari

Run after OS install or updates.

### Testing
TypeScript hooks in `claude/hooks/` use Deno's built-in test runner:
```bash
deno test claude/hooks/git-guardrails.test.ts
deno test claude/hooks/pure-md-prompt-rewriter.test.ts
```

## TypeScript Build Patterns

**Karabiner:** Deno with no deps → single `karabiner.json` output
**Claude hooks:** Deno with TypeScript → no compilation needed (executed directly)

Both Karabiner and Phoenix use function composition over classes. Export small utilities from `lib/`/`utils/` and compose in main file.
