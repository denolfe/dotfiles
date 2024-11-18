#!/usr/bin/env bash

# Quick cd into specified dir, fzf picker
cdf() {
  local dir=$1
  local exa_cmd='eza -alF --icons --color=always --group-directories-first  --no-user --no-permissions --no-filesize --no-time'
  repo=$(find "$dir" -type d -maxdepth 1 -mindepth 1 | awk -F'/' '{print $NF}' | sort | \
fzf --preview "$exa_cmd $dir/{}" --preview-window 70%)
  cd "$dir"/"$repo" || return 1
}

# Quick cd into ~/dev
dev() {
  cdf ~/dev
}

# Quick cd into ~/dev/sandbox
sb() {
  cdf ~/dev/sandbox
}
