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

grau() {
  git remote add upstream "$1" || return 1
  git fetch upstream || return 1
  git branch -u upstream/master
}

getlatest() {
  local stash_string=$(LC_CTYPE=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 32 | xargs)
  git stash push -m $stash_string
  git checkout master
  git pull
  if [[ $(git stash list | head -n1) == *$stash_string* ]]; then
    git stash apply
  fi
}

gscopes() {
  echo -e "\033[96m\033[1mAvailable commit scopes:\033[0m\n"
  git log --pretty=oneline --abbrev-commit --no-merges | grep "):" | cut -d "(" -f2 | cut -d ")" -f1 | sort | uniq | sed "s/^/  /"
  echo
}

git config --global alias.editlast "commit --amend -m" # Make sure to unstage all first!
git config --global alias.sync "!zsh -ic git-sync"
git config --global alias.add-upstream "!zsh -ic add-upstream"
git config --global alias.trav "!zsh -ic git-trav"
