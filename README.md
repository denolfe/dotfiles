# Dotfiles

[![Actions Status](https://github.com/denolfe/dotfiles/workflows/Dotfiles%20Install/badge.svg)](https://github.com/denolfe/dotfiles/actions)
[![Powered by dotbot][dbshield]][dblink]

[dblink]: https://github.com/anishathalye/dotbot
[dbshield]: https://img.shields.io/badge/powered%20by-dotbot-blue?style=flat

> Personal dotfiles configuration for Zsh, Git, Vim, and more to rapidly bootstrap a new system.

![Image](preview.png)

## Components

- [Dotbot](https://github.com/anishathalye/dotbot) - Installation
- Zsh Configuration
  - [Zgenom](https://github.com/jandamm/zgenom) - Plugin Manager
  - [Oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh) - Zsh config framework
  - [Powerlevel10k](https://github.com/romkatv/powerlevel10k) - Theme
  - [asdf](https://github.com/asdf-vm/asdf) - Multi-language version manager
  - [fzf](https://github.com/junegunn/fzf) - Fuzzy finder
- [Karabiner](https://karabiner-elements.pqrs.org/) - Hyper key, global Vim-like binds - written in TypeScript
- [Hammerspoon](https://www.hammerspoon.org/) - global application focus binds and window management
- [neovim](https://github.com/neovim/neovim) and [vim-plug](https://github.com/junegunn/vim-plug)
- [Makefile](./Makefile)
  - Homebrew save/restore
  - VS Code extension save/restore
  - Karabiner config compilation (Deno/TypeScript)
  - Install MacOS defaults

### HammerSpoon

#### Window Launch or Focus

- <kbd>CapsLock</kbd>+<kbd>;</kbd> - iTerm
- <kbd>CapsLock</kbd>+<kbd>'</kbd> - Google Chrome
- <kbd>CapsLock</kbd>+<kbd>/</kbd> - Visual Studio Code
- <kbd>CapsLock</kbd>+<kbd>f</kbd> - Slack
- <kbd>CapsLock</kbd>+<kbd>g</kbd> - Spotify
- <kbd>CapsLock</kbd>+<kbd>t</kbd> - Microsoft Outlook

#### Window Manager

- Dual Window splitting, resize other window to fit
  - <kbd>CapsLock</kbd>+<kbd>q</kbd> - Chained: 60%, 50%, 40%, 33%, 66%
  - <kbd>CapsLock</kbd>+<kbd>e</kbd> - Chained: 40%, 50%, 60%, 66%, 33%
  - <kbd>CapsLock</kbd>+<kbd>w</kbd> - Chained: full, centeredBig, centeredMedium, centeredSmall

- <kbd>CapsLock</kbd>+<kbd>tab</kbd> - Move window to next screen

### Keyboard Remaps - Karabiner

- Hyper Key modifier
  - <kbd>CapsLock</kbd>
  - <kbd>CapsLock</kbd>+<kbd>cmd</kbd>
- Directional Bindings (<kbd>CapsLock</kbd>) w/ Selection (+<kbd>cmd</kbd>)
  - <kbd>h</kbd><kbd>j</kbd><kbd>k</kbd><kbd>l</kbd> - VIM arrows
  - <kbd>n</kbd> - Home
  - <kbd>p</kbd> - End
  - <kbd>m</kbd> - Left one word
  - <kbd>.</kbd> - Right one word
  - <kbd>i</kbd> - Page Up
  - <kbd>u</kbd> - Page Down
  - <kbd>cmd</kbd>+<kbd>i</kbd> - Top of page
  - <kbd>cmd</kbd>+<kbd>u</kbd> - End of page
- Remappings
  - <kbd>CapsLock</kbd>+<kbd>delete</kbd> - Forward delete
  - <kbd>CapsLock</kbd>+<kbd>cmd</kbd>+<kbd>delete</kbd> - Forward delete word
  - <kbd>CapsLock</kbd>+<kbd>a</kbd> - Spaces left
  - <kbd>CapsLock</kbd>+<kbd>d</kbd> - Spaces right
  - <kbd>CapsLock</kbd>+<kbd>s</kbd> - Mission Control
  - <kbd>CapsLock</kbd> +<kbd>cmd</kbd>+<kbd>s</kbd> - Show all app windows

## Usage

*Prerequisites: python, git, zsh*

### Installation

```sh
git clone git@github.com:denolfe/dotfiles.git .dotfiles --recursive
cd .dotfiles
make install
```

### Other Tasks

*[See Makefile](./Makefile)*
