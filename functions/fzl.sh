#!/usr/bin/env bash

fzl() {
  local dest
  dest=$(showmarks | fzf --tac +s +m -e --height 30%) &&
  jump $(echo "$dest" | sed -e 's/\s.*$//')
}
