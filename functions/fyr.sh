#!/usr/bin/env bash

fyr() {
  relative_package=package.json

  if [[ -f "$relative_package" ]]; then
    package="$relative_package"
  else
    package=$(git rev-parse --show-toplevel)/package.json
    echo "No package.json found"
    return 1
  fi

  jq -r '.scripts | to_entries | map("\(.key)\t\(.value|tostring)")|.[]' "$package" | \
  awk -F'\t' '{printf "%-15s %-30s\n", $1, $2}' | \
  fzf --height 30% | \
  sed 's/ .*//' | \
  xargs yarn
}
