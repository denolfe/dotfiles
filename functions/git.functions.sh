#!/usr/bin/env bash
#
# Git helper functions

# Add upstream remote and set tracking of master
grau() {
  git remote add upstream "$1" || return 1
  git fetch upstream || return 1
  git branch -u upstream/"$(command git branch --show-current)"
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

gswb() {
  git checkout "$(gbv | cut -c 3- | awk -F ' - ' '{ print $1 }' | fzf --height 30% --prompt="Checkout Branch > ")"
}

gswpr() {
  git fetch origin "$1"
  git switch "$1"
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

__repo_url=''

# Open Origin Url
gro() {
  origin_url=$(git config --get remote.origin.url)
  __construct_repo_url "$origin_url"

  if [ -z "$1" ]; then
    url="$__repo_url"
  else
    url="$__repo_url/$1"
  fi
  echo Opening "$url"...
  open "$url"
}

# Open Upstream Url
group() {
  remote_url=$(git config --get remote."$(git config branch.master.remote)".url)
  __construct_repo_url "$remote_url"

  if [ -z "$1" ]; then
    url="$__repo_url"
  else
    url="$__repo_url/$1"
  fi
  echo Opening "$url"...
  open "$url"
}

# Open current branch's GitHub actions
gac() {
  remote_url=$(git config --get remote.origin.url)
  __construct_repo_url "$remote_url"

  url="$__repo_url/actions?query=branch%3A$(git branch --show-current)"
  echo Opening "$url"...
  open "$url"
}

# Open PRs for current branch
grop() {
  remote_url=$(git config --get remote.origin.url)
  __construct_repo_url "$remote_url"

  url="$__repo_url/pulls?q=is%3Apr+is%3Aopen+head%3A$(git branch --show-current)"
  echo Opening "$url"...
  open "$url"
}

__construct_repo_url() {
  if [[ $1 =~ ^git@(.*):(.*)/(.*).git$ ]]; then
    __repo_url=https://${match[1]}/${match[2]}/${match[3]}
  elif [[ $1 =~ ^(https://.*)/(.*)/(.*).git$ ]]; then
    __repo_url=${match[1]}/${match[2]}/${match[3]}
  else
    echo "Unable to find remote url"
    return 1
  fi
}
