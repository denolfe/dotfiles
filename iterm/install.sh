#!/usr/bin/env bash
#
# Set iterm defaults

source "$(dirname "$0")"/../_script/logging

defaults write com.googlecode.iterm2 PromptOnQuit -bool false
success "Set iTerm defaults"
