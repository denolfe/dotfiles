#!/usr/bin/env bash

# Open current package on npmjs.com
#
# USAGE: npmjs

npmjs() {
  relative_package=package.json

  if [[ -f "$relative_package" ]]; then
    package="$relative_package"
  else
    package=$(git rev-parse --show-toplevel)/package.json
    echo "No package.json found"
    return 1
  fi

  package_name=$(jq -r '.name' "$package")
  url="https://www.npmjs.com/package/$package_name"
  open "$url"
}
