#!/usr/bin/env bash
#
# Set iterm defaults

source ~/.dotfiles/_script/logging

defaults write com.googlecode.iterm2 PromptOnQuit -bool false
success "Set iTerm defaults"
