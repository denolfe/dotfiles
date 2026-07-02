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

# Interactive git log browser: gl-style list on the left, live delta diff on the right.
# Passes args through to git log (e.g. gli main..HEAD, gli -20, gli --author=me).
# Keys: enter=pager, ctrl-y=copy hash,
#       ctrl-o=open associated PR on GitHub (falls back to commit page).
gli() {
  local remote_url
  remote_url=$(git config --get remote.origin.url)

  local repo_url
  if [[ "$remote_url" =~ ^git@ ]]; then
    repo_url="https://github.com/${remote_url#*:}"
    repo_url="${repo_url%.git}"
  else
    repo_url="${remote_url%.git}"
  fi

  # Open the associated PR if there is one, else fall back to the commit page.
  # Only build the GitHub action for a well-formed github.com owner/repo URL:
  # remote.origin.url is not always user-typed (e.g. injected via .gitmodules),
  # and repo_url is concatenated into a string fzf runs via `sh -c`. The strict
  # allowlist keeps shell metacharacters out of that command source.
  local open_gh
  if [[ "$repo_url" =~ ^https://github\.com/[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$ ]]; then
    local owner_repo="${repo_url#https://github.com/}"
    open_gh="url=\$(gh api repos/${owner_repo}/commits/{1}/pulls --jq '.[0].html_url' 2>/dev/null); [ -n \"\$url\" ] && open \"\$url\" || open ${repo_url}/commit/{1}"
  else
    open_gh="echo 'gli: ctrl-o needs a github.com remote' >&2"
  fi

  # Emit "<raw-hash>\t<gl-styled-line>"; fzf hides column 1 but keeps it for {1}.
  git log --abbrev=7 --format='%h|%s|%cr|%an|%d' "$@" | awk -F'|' '
  {
    hash = $1
    gsub(/ hours?/, " hrs", $3)
    gsub(/ minutes?/, " mins", $3)
    gsub(/ ago/, "", $3)
    printf "%s\t\033[1;36m%s\033[0m %s \033[32m(%s)\033[0m \033[34m<%s>\033[0m \033[33m%s\033[0m\n", hash, $1, $2, $3, $4, $5
  }' | fzf --ansi --no-sort --delimiter='\t' --with-nth=2 \
    --header $'enter: view · ctrl-y: copy hash · ctrl-o: PR/commit' \
    --preview 'git show --color=always --shortstat --patch {1} | delta' \
    --preview-window 'down,80%,nohidden' \
    --bind "enter:execute(git show --color=always {1} | delta | less -R)" \
    --bind "ctrl-y:execute-silent(printf %s {1} | pbcopy)" \
    --bind "ctrl-o:execute-silent($open_gh)"
}
