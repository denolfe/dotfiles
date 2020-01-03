#!/usr/bin/env bash

# Interactive git checkout specific commit
# Ctrl-o to perform checkout of currently selected commit
fcom() {
  local commits commit out key
  commits=$(git log --pretty=format:"%h %s (%cr) <%an>" --abbrev-commit --reverse) &&
  out=$(echo "$commits" | fzf --tac +s +m -e --header "Ctrl-o to checkout commit" --expect=ctrl-o)
  key=$(head -1 <<< "$out")
  commit=$(sed 1d <<< "$out")
  if [ "$key" = ctrl-o ]; then
    git checkout $(echo "$commit" | sed "s/ .*//")
  else
    echo "$commit"
  fi
}
