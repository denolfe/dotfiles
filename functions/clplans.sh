#!/usr/bin/env bash

# View and open Claude plans in the terminal using fzf.
clplans() {
  local dir="$HOME/.claude/plans"
  local file
  # Narrow terminals can't fit a side-by-side preview legibly; go bottom instead.
  # ctrl-x toggles to the other orientation.
  local cols=${COLUMNS:-0}
  (( cols == 0 )) && cols=$(tput cols 2>/dev/null || echo 120)
  local preview toggle
  if (( cols < 150 )); then
    preview='down,80%,wrap'
    toggle='right,60%,wrap'
  else
    preview='right,60%,wrap'
    toggle='down,80%,wrap'
  fi
  file=$(cd "$dir" && rg --files -g '*.md' \
    | xargs stat -f '%m %N' \
    | sort -rn \
    | cut -d' ' -f2- \
    | fzf --height=100% --preview "viewmd -r $dir/{}" --preview-window="${preview}:nohidden" \
        --bind 'ctrl-j:preview-half-page-down,ctrl-k:preview-half-page-up' \
        --bind "ctrl-x:change-preview-window(${toggle}|${preview})") || return
  file="$dir/$file"
  print -rs -- "viewmd ${(q)file}"
  viewmd "$file"
}

# Open the most recently modified Claude plan.
clplansl() {
  local file
  file=$(rg --files ~/.claude/plans -g '*.md' \
    | xargs stat -f '%m %N' \
    | sort -rn \
    | head -1 \
    | cut -d' ' -f2-) || return
  [[ -z "$file" ]] && return
  print -rs -- "viewmd ${(q)file}"
  viewmd "$file"
}
