#!/usr/bin/env bash

fcom() {
  local commits commit
  commits=$(git log --pretty=format:"%h %s (%cr) <%an>" --abbrev-commit --reverse) &&
  commit=$(echo "$commits" | fzf --tac +s +m -e) &&
  echo $commit
}
