# Dotfiles

[![Actions Status](https://github.com/denolfe/dotfiles/workflows/Dotfiles%20Install/badge.svg)](https://github.com/denolfe/dotfiles/actions)
[![Powered by dotbot][dbshield]][dblink]

[dblink]: https://github.com/anishathalye/dotbot
[dbshield]: https://img.shields.io/badge/powered%20by-dotbot-blue?style=flat

> Personal dotfiles configuration for Zsh, Git, Vim, and more to rapidly bootstrap a new system.

![Image](preview.png)

## Installation

```sh
git clone git@github.com:denolfe/dotfiles.git .dotfiles
cd .dotfiles
./install
```

## Components

- Installation performed using [dotbot](https://github.com/anishathalye/dotbot)

- Zsh Configuration
  - [Zgen](https://github.com/tarjoilija/zgen) - Plugin Manager
  - [Oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh) - Zsh config framework
  - [Powerlevel9k](https://github.com/Powerlevel9k/powerlevel9k) - Theme
  - [asdf](https://github.com/asdf-vm/asdf) - Multi-language version manager
  - [fzf](https://github.com/junegunn/fzf) - Fuzzy finder
  - Functions and aliases from each topic area are sourced
- [neovim](https://github.com/neovim/neovim) and [vim-plug](https://github.com/junegunn/vim-plug)
- Git config and aliases (be sure to change user.name and user.email if using mine)
