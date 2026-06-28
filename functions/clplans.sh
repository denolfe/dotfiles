#!/usr/bin/env bash

# View and open Claude plans in the terminal using fzf.
clplans() {
  local file
  file=$(rg --files ~/.claude/plans -g '*.md' \
    | xargs stat -f '%m %N' \
    | sort -rn \
    | cut -d' ' -f2- \
    | fzf) || return
  print -rs -- "sanemd ${(q)file}"
  sanemd "$file"
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
  print -rs -- "sanemd ${(q)file}"
  sanemd "$file"
}
