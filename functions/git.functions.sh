#!/usr/bin/env bash
#
# Git helper functions

# Add upstream remote and set tracking of master
grau() {
  git remote add upstream "$1" || return 1
  git fetch upstream || return 1
  git branch -u upstream/"$(command git branch --show-current)"
}

# Annotated tag convenience function
gtag() {
  git tag -a "$1" -m "$1"
}

# Stash changes, get latest master, re-apply
getlatest() {
  local stash_string
  stash_string=$(LC_CTYPE=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 32 | xargs)
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
# Optional -n flag to sort numerically
gscopes() {
  local output
  output=$(git log --pretty=oneline --abbrev-commit --no-merges | grep "):" | cut -d "(" -f2 | cut -d ")" -f1)

  # Check for the -n flag to sort numerically
  if [[ "$1" == "-n" ]]; then
    output=$(echo "$output" | sort | uniq -c | sort -rn | sed "s/^/  /")
  else
    output=$(echo "$output" | sort | uniq -c | sort -k2 | sed "s/^/  /")
  fi

  echo -e "\033[96m\033[1mPrevious commit scopes:\033[0m\n"
  echo "$output"
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

# Git Diff with FZF preview
gdf() {
  git ls-files -m --exclude-standard | fzf --preview-window down,80% --preview "git diff {} | delta" | xargs -o -t git diff
}

gltagl() {
  tag_pattern="v3*"
  if [ -n "$1" ]; then
    tag_pattern="$1"
  fi

  git describe --match "$tag_pattern" --abbrev=0 --tags "$(git rev-list --tags --max-count=1)"
}

# Diff between latest tag and HEAD
gltagd() {
  if [ -n "$1" ]; then
    tag=$1
  else
    tag=$(gltagl "$@")
  fi

  echo "Diff: $tag..HEAD"
  echo

  git l3 "$tag"..HEAD
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

# Open Brnach Url
gbo() {
  remote_url=$(git config --get remote.origin.url)
  __construct_repo_url "$remote_url"

  if [ -z "$1" ]; then
    url="$__repo_url/tree/$(git branch --show-current)"
  else
    url="$__repo_url/tree/$1"
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
  __construct_repo_url "$(git config --get remote.origin.url || true)"

  url="$__repo_url/actions?query=branch%3A$(git branch --show-current)"
  echo Opening "$url"...
  open "$url"
}

# Open latest GitHub action run for current branch
gaco() {
  open "$(gh run list --workflow main.yml --branch "$(git branch --show-current)" --json url --jq '.[0].url')"
}

# Get status of current action run for current branch
gacstat() {
  local actions_status
  actions_status=$(gh run list --workflow main.yml --branch "$(git branch --show-current)" --json status --jq '.[0].status')
  echo "Actions status: $actions_status"
}

# Open PRs for current branch
grop() {
  remote_url=$(git config --get remote.origin.url)
  __construct_repo_url "$remote_url"

  pr_number=$(git config --get branch."$(git branch --show-current)".github-pr-owner-number | awk -F "#" '{print $3}')

  if [ -z "$pr_number" ]; then
    url="$__repo_url/pulls?q=is%3Apr+is%3Aopen+head%3A$(git branch --show-current)"
  else
    url="$__repo_url/pull/$pr_number"
  fi

  echo Opening "$url"...
  open "$url"
}

# Open current branch on GitHub
grob() {
  remote_url=$(git config --get remote.origin.url)
  __construct_repo_url "$remote_url"

  url="$__repo_url/tree/$(git branch --show-current)"
  echo Opening "$url"...
  open "$url"
}

# Open settings in GitHub for current repo
gros() {
  remote_url=$(git config --get remote.origin.url)
  __construct_repo_url "$remote_url"

  url="$__repo_url/settings"
  echo Opening "$url"...
  open "$url"
}

# Open specific commit hash or tag on GitHub
groc() {
  remote_url=$(git config --get remote.origin.url)
  __construct_repo_url "$remote_url"

  url="$__repo_url/commit/$1"
  echo Opening "$url"...
  open "$url"
}

# Create new PR for current branch, format title for conventional commits
#
# Usage: ghprc main|beta
ghprc() {
  local base=$1

  if [[ -z ${base} ]]; then
    base='main'
  fi

  url=$(gh pr create --fill-first --body="" --base="$base")
  echo "$url"

  pr_number=$(echo "$url" | awk -F "/" '{print $7}')
  gsetpr "$pr_number"
  open "$url"
}

gsetpr() {
  local pr_number=$1

  if [ -z "$pr_number" ]; then
    echo "PR number required"
    return 1
  fi

  local owner_repo
  owner_repo=$(git config --get remote.origin.url | awk -F ":" '{print $2}' | awk -F ".git" '{print $1}' | tr '/' '#')

  git config branch."$(git branch --show-current)".github-pr-owner-number "$owner_repo#$pr_number"
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

# Use llm cli to generate a commit message
# Work in progress
gcmsgpt() {
  if [ -n "$1" ]; then
    commit_msg=$(git diff "$1" | llm prompt "$(cat ~/.dotfiles/llm/prompts/commit-msg.txt)")
  else
    commit_msg=$(git diff | llm prompt "$(cat ~/.dotfiles/llm/prompts/commit-msg.txt)")
  fi
  echo "$commit_msg"
}
