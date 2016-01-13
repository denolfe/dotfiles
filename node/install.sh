#!/usr/bin/env bash
#
# Check for npm packages

source ~/.dotfiles/script/logging

npm_installed() {
	if npm list -g $1 | grep $1 --quiet; then
		success $1
	else
		error $1
		installing $1
		sudo npm install $1 -g
		success $1
	fi
}

header "npm Packages"

for pkg in bower grunt gulp express
do
	npm_installed $pkg
done