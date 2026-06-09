#!/usr/bin/env bash

# Open current package on npmjs.com
#
# USAGE: npmjs

npmjs() {
  relative_package=package.json

  if [[ -f "$relative_package" ]]; then
    package="$relative_package"
  else
    echo "No package.json found at $relative_package"
    return 1
  fi

  package_name=$(jq -r '.name' "$package")
  if [[ -z "$package_name" || "$package_name" == "null" ]]; then
    echo "No package name found in $package"
    return 1
  fi

  # Scoped packages (@scope/name) require the slash encoded for the registry endpoint
  registry_name="${package_name/\//%2f}"
  if ! curl -fsL -o /dev/null "https://registry.npmjs.org/$registry_name" 2>/dev/null; then
    echo "Package '$package_name' not found on npm registry"
    return 1
  fi

  url="https://www.npmjs.com/package/$package_name"
  open "$url"
}
