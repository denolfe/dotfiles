# denolfe's dotfiles

[![Actions Status](https://github.com/denolfe/dotfiles/workflows/Dotfiles%20Install/badge.svg)](https://github.com/denolfe/dotfiles/actions)
[![Powered by dotbot][dbshield]][dblink]

[dblink]: https://github.com/anishathalye/dotbot
[dbshield]: https://img.shields.io/badge/powered%20by-dotbot-blue?style=flat

> Personal dotfiles configuration

![Image](preview.png)

| Component                                | Tool                                                      | Config                                                                    |
| ---------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| Installation                             | [Dotbot](https://github.com/anishathalye/dotbot)          | [install.conf.yaml](./install.conf.yaml)                                  |
| Terminal                                 | [Ghostty](https://ghostty.org)                            | [config](./ghostty/config)                                                |
| Prompt                                   | [Powerlevel10k](https://github.com/romkatv/powerlevel10k) | [customizations](./zsh/p10k.customizations.zsh), [config](./zsh/p10k.zsh) |
| .zshrc                                   | [oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh)    | [.zshrc](./zsh/zshrc.zsh)                                                 |
| Global Key Rebinds, Hyper Key, App Focus | [Karabiner](https://karabiner-elements.pqrs.org/)         | [karabiner.ts](./karabiner/karabiner.ts)                                  |

## [Makefile](./Makefile)

- Install with dotbot
- Homebrew save/restore
- VS Code extension save/restore
- Karabiner config compilation
- Install MacOS defaults

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
