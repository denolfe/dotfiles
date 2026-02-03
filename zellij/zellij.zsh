# Zellij shell integrations
# Sourced only when running inside Zellij

[[ -z "$ZELLIJ" ]] && return

# Pane title: repo/dir + git branch (worktree-aware)
function _zellij_pane_title_precmd() {
  local title branch toplevel dirname gitdir repo
  if toplevel=$(git rev-parse --show-toplevel 2>/dev/null); then
    dirname="${toplevel##*/}"
    branch=$(git branch --show-current 2>/dev/null)
    if [[ -n "$branch" && "$dirname" == "$branch" ]]; then
      # Worktree named after branch - show main repo name instead
      gitdir=$(git rev-parse --git-common-dir 2>/dev/null)
      repo="${gitdir%/.git}"
      title="${repo##*/} @ $branch"
    elif [[ -n "$branch" ]]; then
      title="$dirname @ $branch"
    else
      title="$dirname"
    fi
  else
    title="${PWD##*/}"
  fi
  print -Pn "\e]0;$title\a"
}
add-zsh-hook precmd _zellij_pane_title_precmd
