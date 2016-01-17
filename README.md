# Dotfiles

My dotfiles for Elementary OS

![Image](preview.png)

## Components

- Makefile
  - `sync` - links all `*.symlink` files as `.filename` in `~` directory
  - `install` - Runs all `install.sh` files
  - `check` - Checks for dependencies listed in `dependencies` file project root
  - `update` - Updates git submodules and zgen
  - `list` - Quick list of installers, aliases, and path additions
- Zsh Configuration
  - [Oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh)
  - [Zgen](https://github.com/tarjoilija/zgen)
  - Agnoster theme (modified)
  - Functions and Aliases
- xbindkeys configuration
	- Super	+ HJKL movement
  - Window activation hotkeys
  - Acer C720 brightness keys
- Git config and aliases (be sure to change user.name and user.email if using mine)
