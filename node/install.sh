#!/usr/bin/env bash
#
# Check for npm packages

source ../_script/logging

header "Node"

if [ -x "$(command -v npm)" ]; then
	success npm
else
	error npm
	installing npm
	sudo apt-get -qq install npm > /dev/null
	installing_done
fi

if [ ! -d ~/.nvm ]; then
	error nvm
	installing nvm
	git clone https://github.com/creationix/nvm.git ~/.nvm && cd ~/.nvm && git checkout "$(git describe --abbrev=0 --tags)"
	installing_done
fi
source ~/.nvm/nvm.sh
nvm use system >/dev/null 2>&1
success "node $(node -v)"

npm_installed() {
	if npm list -g "$1" | grep "$1" --quiet; then
		success "$1"
	else
		error "$1"
		installing "$1"
		sudo npm install "$1" -g
		success "$1"
	fi
}

for pkg in bower grunt gulp express serve
do
	npm_installed $pkg
done
