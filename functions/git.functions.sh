#!/usr/bin/env bash
#
# Git helper functions

# Add upstream remote and set tracking of master
grau() {
  git remote add upstream "$1" || return 1
  git fetch upstream || return 1
  git branch -u upstream/master
}

# Stash changes, get latest master, re-apply
getlatest() {
  local stash_string=$(LC_CTYPE=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 32 | xargs)
  git stash push -m $stash_string
  git checkout master
  git pull
  if [[ $(git stash list | head -n1) == *$stash_string* ]]; then
    git stash apply
  fi
}

# Show previously used conventional commit scopes
gscopes() {
  local output=$(git log --pretty=oneline --abbrev-commit --no-merges | grep "):" | cut -d "(" -f2 | cut -d ")" -f1)
  if [[ "$1" == "-c" ]];then
    output=$(echo $output | sort | uniq -c | sort -rn | sed "s/^/  /")
  else
    output=$(echo $output | sort | uniq | sed "s/^/  /")
  fi
  echo -e "\033[96m\033[1mPrevious commit scopes:\033[0m\n"
  echo $output
}

# Diff commits with tracked remote branch
glremote() {
  remote_branch=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)
  if [[ -z $remote_branch ]]; then
    echo 'No tracked remote branch, using origin/master'
    remote_branch="origin/master"
  fi
  git log $remote_branch..HEAD --format='%C(bold cyan)%h%Creset %s %Cgreen(%cr) %C(blue)<%an>%Creset%C(yellow)%d%Creset'
}

# Diff commits with master
glmaster() {
  git log master..HEAD --format='%C(bold cyan)%h%Creset %s %Cgreen(%cr) %C(blue)<%an>%Creset%C(yellow)%d%Creset'
}
