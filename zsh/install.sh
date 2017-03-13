#!/usr/bin/env bash
source "$(dirname "$0")"/../_script/logging

header "Zsh Dependencies"

if test "$(which zsh)"; then
	success "zsh"
else
	error "zsh"
	installing "zsh"
	brew install zsh
	chsh -s /usr/bin/zsh
	installing_done "zsh"
fi
