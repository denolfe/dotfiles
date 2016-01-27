# Dotfiles 

[![Build Status][tshield]][tlink] [![Powered by zgen][zshield]][zlink]

> Personal dotfiles for Zsh, Git, Node, and more to allow bootstrapping a new system.

![Image](preview.png)

[tshield]: https://img.shields.io/travis/denolfe/dotfiles.svg?style=flat-square
[tlink]: https://travis-ci.org/denolfe/dotfiles
[zlink]: https://github.com/tarjoilija/zgen
[zshield]: https://img.shields.io/badge/powered%20by-zgen-blue.svg?style=flat-square

## Components

- Makefile
  - `sync` - links all `*.symlink` files as `.filename` in `~` directory
  - `install` - Runs all `install.sh` files
  - `check` - Checks for dependencies listed in `dependencies` file project root
  - `update` - Updates git submodules and zgen
  - `list` - Quick list of installers, aliases, and path additions
- [Travis CI builds](https://travis-ci.org/denolfe/dotfiles) with [Shellcheck](http://www.shellcheck.net) linting
- Zsh Configuration
  - [Zgen](https://github.com/tarjoilija/zgen) - Plugin Manager
  - [Oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh) - Zsh config framework
  - Agnoster theme (modified)
  - Functions and Aliases
- xbindkeys configuration
	- Super	+ HJKL movement
  - Window activation hotkeys
  - Acer C720 brightness keys
- Git config and aliases (be sure to change user.name and user.email if using mine)
