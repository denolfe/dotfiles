#!/usr/bin/env bash

# Interactive npm run script
fnpr() {
  cat $(git rev-parse --show-toplevel)/package.json | \
  jq -r '.scripts | to_entries | map("\(.key)\t\(.value|tostring)")|.[]' | \
  awk -F'\t' '{printf "%-15s %-30s\n", $1, $2}' | \
  fzf --height 30% | \
  sed 's/ .*//' | \
  xargs npm run
}
