#!/usr/bin/env bash

fyr() {
  package=$(git rev-parse --show-toplevel)/package.json
  if [[ ! -f "$package" ]];then
    echo "No package.json found"
    return 1
  fi
  jq -r '.scripts | to_entries | map("\(.key)\t\(.value|tostring)")|.[]' "$package" | \
  awk -F'\t' '{printf "%-15s %-30s\n", $1, $2}' | \
  fzf --height 30% | \
  sed 's/ .*//' | \
  xargs yarn
}
