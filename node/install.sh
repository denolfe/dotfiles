#!/usr/bin/env bash
#
# Check for npm packages

source "$(dirname "$0")"/../_script/logging

header "Node"

if [ -x "$(command -v npm)" ]; then
	success npm
else
	installing npm
	brew install npm
	installing_done
fi

if [ ! -d ~/.nvm ]; then
	installing nvm
	curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
	installing_done
fi
source ~/.nvm/nvm.sh
nvm use system >/dev/null 2>&1
success "node $(node -v)"
