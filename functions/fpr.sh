#!/usr/bin/env bash

# USAGE: fpr [-s]
#
# OPTIONS:
#  -s    short - omit full command of each script

fpr() {
  relative_package=package.json

  if [[ -f "$relative_package" ]]; then
    package="$relative_package"
  else
    package=$(git rev-parse --show-toplevel)/package.json
    echo "No package.json found"
    return 1
  fi

  scripts=$(jq -r '.scripts | to_entries | map("\(.key)\t\(.value|tostring)")|.[]' "$package")

  if [ "$1" = "-s" ]; then
    formatted_list=$(echo "$scripts" | awk -F'\t' '{print $1}')
  else
    formatted_list=$(echo "$scripts" |awk -F'\t' '{printf "%-20s %-30s\n", $1, $2}')
  fi

  echo "$formatted_list" | \
  fzf | \
  sed 's/ .*//' | \
  xargs pnpm run
}
