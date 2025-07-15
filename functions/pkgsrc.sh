#!/usr/bin/env bash

# Opens the source repository of an npm package in the web browser.
# Usage: pkgsrc <package-name>

function pkgsrc() {
  local package_name="$1"
  if [[ -z "$package_name" ]]; then
    echo "Usage: pkgsrc <package-name>"
    return 1
  fi

  local url
  url=$(curl -s "https://registry.npmjs.org/$package_name" | jq -r '.repository.url')

  if [[ -z "$url" || "$url" == "null" ]]; then
    echo "No repository URL found for package '$package_name'"
    open "https://www.npmjs.com/search?q=$package_name"
    return 1
  fi

  # Remove the 'git+' prefix and the '.git' suffix
  url="${url#git+}"
  url="${url%.git}"
  # replace 'git://' with 'https://' and 
  url="${url/git:\/\//https://}"

  open "$url"
}
