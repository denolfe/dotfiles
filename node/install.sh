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

npm_installed() {
	if npm list -g "$1" | grep "$1" --quiet; then
		success "$1"
	else
		installing "$1"
		sudo npm install "$1" -g --silent
		success "$1"
	fi
}

for pkg in bower grunt gulp express serve
do
	npm_installed $pkg
done
