#!/usr/bin/env bash
source ~/.dotfiles/_script/logging

header "Zsh Dependencies"

if ! is_installed "zsh"; then
	success "zsh"
else
	error "zsh"
	installing "zsh"
	sudo apt-get install zsh -y
	chsh -s /usr/bin/zsh
	installing_done "zsh"
fi

if [ -L ~/.oh-my-zsh ]; then
	success "oh-my-zsh"
else
	error "oh-my-zsh"
fi

if [ -L ~/.zgen ]; then
	success "zgen"
else
	error "zgen"
fi

# Use this snippet for dependencies that require additional installation steps

# if ! is_installed "xbindkeys"; then
# 	success "xbindkeys"
# else
# 	error "xbindkeys"
# 	# installing "xbindkeys"
# 	# sudo apt-get install xbindkeys -y
# 	# installing_done "xbindkeys"
# fi
