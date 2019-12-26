#!/usr/bin/env bash

fcoc() {
  local commits commit
  commits=$(git log --pretty=format:"%h %s (%cr) <%an>" --abbrev-commit --reverse) &&
  commit=$(echo "$commits" | fzf --tac +s +m -e) &&
  git checkout $(echo "$commit" | sed "s/ .*//")
}
