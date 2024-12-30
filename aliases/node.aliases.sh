#!/usr/bin/env bash

alias ns='npm start'
alias npis='npm install --save'
alias npisd='npm install --save-dev'
alias npig='npm install -g'
alias npit='npm init'
alias npi='npm install'
alias npnuke='rm -rf node_modules && npm install'

alias y='yarn'
alias yr='yarn run'
alias ya='yarn add'
alias yga='yarn global add'
alias yrm='yarn remove'
alias yad='yarn add --dev'
alias ynuke='rm -f yarn.lock && rm -rf node_modules && yarn'

alias la='lerna add'
alias lad='lerna add --dev'

alias cpj='cat package.json | jless'
alias cpjs='cat package.json | jq -r ".scripts" | jless'
alias cpjv='cat package.json | jq -r ".version"'

# Reverse pnpm aliases set by pnpm plugin
alias pi='pnpm install'
alias pin='pnpm init'

alias pii='pnpm install --ignore-workspace'
alias prein='rm -rf node_modules && pnpm install'
alias pv='pnpm view'

function pvl() {
  pnpm view "$1" dist-tags.latest
}
