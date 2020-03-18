#!/usr/bin/env bash
#
# Some additional git aliases

alias gst="git status"
alias gau="git add -u"
alias gbd="git branch -D"
alias gbm="git branch --merged"
alias gbnm="git branch --no-merged"
alias gbu="git branch -u"
alias gbv="git branch -v"
alias gbv="git for-each-ref --sort=-committerdate refs/heads/ --format='%(HEAD) %(color:yellow)%(refname:short)%(color:reset) - %(color:red)%(objectname:short)%(color:reset) - %(contents:subject) (%(color:green)%(committerdate:relative)%(color:reset))'"
alias gbvv="git branch -vv"
alias gcane="git commit --amend --no-edit"
alias gcof="git checkout -f"
alias gdc="git diff --cached"
alias gdlast="git diff HEAD~1..HEAD"
alias gh="git hist"
alias gl="git l3"
alias glast="git log -1 HEAD"
alias gpdel="git push --delete"
alias gpl="git pull"
alias groot='if [ "`git rev-parse --show-cdup`" != "" ]; then cd `git rev-parse --show-cdup`; fi'
alias gstu="git status -uno"
alias gundo="git reset HEAD~1"
alias guns="git reset HEAD --"

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
gdremote() {
  remote_branch=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)
  git log $remote_branch..HEAD --format='%C(bold cyan)%h%Creset %s %Cgreen(%cr) %C(blue)<%an>%Creset%C(yellow)%d%Creset'
}
