#!/usr/bin/env bash
#
# Custom git log with abbreviated commit hash, relative dates, and clickable issue number links
#
# Modeled after: git config --global alias.l3 "log --abbrev=7 --format='%C(bold cyan)%h%Creset %s %Cgreen(%cr) %C(blue)<%<(8,trunc)%an>%Creset%C(yellow)%d%Creset'"

gl() {
  local remote_url
  remote_url=$(git config --get remote.origin.url)

  local repo_url
  if [[ "$remote_url" =~ ^git@ ]]; then
    repo_url="https://github.com/${remote_url#*:}"
    repo_url="${repo_url%.git}"
  else
    repo_url="${remote_url%.git}"
  fi

  # pass arguments to git log
  git log --abbrev=7 --format='%h|%s|%cr|%an|%d' "$@" | awk -F'|' -v repo_url="$repo_url" '
  {
    # Shorten some relative date formats
    gsub(/ hours?/, " hrs", $3)
    gsub(/ minutes?/, " mins", $3)
    gsub(/ ago/, "", $3)

    # Make all short hashes commit links, uses zero-width space to properly output hash
    gsub(/^[0-9a-f]+/, sprintf("\033]8;;%s/commit/&\033\\​&\033]8;;\033\\", repo_url), $1)

    # Replace any number in the commit message with a clickable link,
    # uses zero-width space to properly output number without preceding '#'
    gsub(/[0-9]+/, sprintf("\033]8;;%s/issues/&\033\\​&\033]8;;\033\\", repo_url), $2)

    # Make all semver tags into links
    gsub(/v[0-9]+\.[0-9]+\.[0-9]+/, sprintf("\033]8;;%s/releases/tag/&\033\\​&\033]8;;\033\\", repo_url), $5)

    # Format the output with colors
    printf "\033[1;36m%s\033[0m %s \033[32m(%s)\033[0m \033[34m<%s>\033[0m \033[33m%s\033[0m\n", $1, $2, $3, $4, $5
  }' | less -R
}
