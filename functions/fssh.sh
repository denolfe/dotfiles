#!/usr/bin/env bash

function fssh () {
  local selected_host=$(grep "Host " $HOME/.ssh/config | \
    grep -v '*' | \
    cut -b 6- | \
    fzf --height 30% --prompt="SSH Remote > ")

  if [ -z "$selected_host" ]; then return 1; fi
  ssh "${selected_host}"
}
