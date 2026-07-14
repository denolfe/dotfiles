#!/usr/bin/env bash

# View and open Claude plans in the terminal using fzf.
clplans() {
  local dir="$HOME/.claude/plans"
  local file
  file=$(cd "$dir" && rg --files -g '*.md' \
    | xargs stat -f '%m %N' \
    | sort -rn \
    | cut -d' ' -f2- \
    | fzf --preview "viewmd -r $dir/{}" --preview-window=right:60%:nohidden:wrap \
        --bind 'ctrl-j:preview-half-page-down,ctrl-k:preview-half-page-up') || return
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
