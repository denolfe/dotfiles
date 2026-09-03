#!/usr/bin/env bash

# Pick and view a markdown file with fzf, newest first.
# rg --files honors .gitignore so node_modules etc. are skipped.
# Usage: viewmdl [dir]  (defaults to cwd)
viewmdl() {
  local dir="${1:-$PWD}"
  local file
  # Narrow terminals can't fit a side-by-side preview legibly; go bottom instead.
  # ctrl-x toggles to the other orientation.
  local cols=${COLUMNS:-0}
  (( cols == 0 )) && cols=$(tput cols 2>/dev/null || echo 120)
  local preview toggle
  if (( cols < 150 )); then
    preview='down,85%,wrap'
    toggle='right,60%,wrap'
  else
    preview='right,60%,wrap'
    toggle='down,85%,wrap'
  fi
  file=$(cd "$dir" && rg --files -g '*.md' \
    | xargs stat -f '%m %N' \
    | sort -rn \
    | cut -d' ' -f2- \
    | fzf --height=100% --preview "viewmd -r ${(q)dir}/{}" --preview-window="${preview}:nohidden" \
        --bind 'ctrl-j:preview-half-page-down,ctrl-k:preview-half-page-up' \
        --bind "ctrl-x:change-preview-window(${toggle}|${preview})") || return
  file="$dir/$file"
  print -rs -- "viewmd ${(q)file}"
  viewmd "$file"
}
