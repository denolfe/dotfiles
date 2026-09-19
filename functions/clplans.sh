#!/usr/bin/env bash

# View and open shared agent plans in the terminal using fzf.
# Usage: clplans [dir]
clplans() {
  viewmdl "${1:-$HOME/.agents/plans}"
}

# Open the most recently modified shared agent plan.
clplansl() {
  local file
  file=$(rg --files ~/.agents/plans -g '*.md' \
    | xargs stat -f '%m %N' \
    | sort -rn \
    | head -1 \
    | cut -d' ' -f2-) || return
  [[ -z "$file" ]] && return
  print -rs -- "viewmd ${(q)file}"
  viewmd "$file"
}
