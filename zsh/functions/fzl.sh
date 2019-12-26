#!/usr/bin/env bash

fzl() {
  local dest
  dest=$(showmarks | fzf --tac +s +m -e) &&
  jump $(echo "$dest" | sed -e 's/\s.*$//')
}
