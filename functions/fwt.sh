#!/usr/bin/env bash

# USAGE: fwt
#
# Select a git worktree with fzf and cd into it

fwt() {
  local selection cwd
  cwd=$(git rev-parse --show-toplevel 2>/dev/null)
  selection=$(git worktree list --porcelain | \
    awk -v cwd="$cwd" -v now="$(date +%s)" '
      function reltime(epoch,   d) {
        d = now - epoch
        if (d < 3600)   return int(d/60) "m ago"
        if (d < 86400)  return int(d/3600) "h ago"
        if (d < 604800) return int(d/86400) "d ago"
        return int(d/604800) "w ago"
      }
      /^worktree / { path = substr($0, 10); branch = ""; detached = 0 }
      /^branch /   { sub("refs/heads/", "", $2); branch = $2 }
      /^detached/  { detached = 1 }
      /^$/ && path && !detached && path != cwd {
        "stat -f %B " path | getline created
        "stat -f %m " path | getline mtime
        cmd = "git -C \"" path "\" log -1 --format=%ct 2>/dev/null"
        cmd | getline committed; close(cmd)
        n = split(path, parts, "/")
        flat = branch; gsub("/", "-", flat)
        label = (parts[n] == flat) ? branch : branch "*"
        printf "%s\t%s\t%-40s %-10s created %s\n", \
          mtime, path, label, reltime(committed), reltime(created)
        path = ""
      }
    ' | \
    sort -rn | \
    cut -f2- | \
    fzf --header="Select worktree (recent first)" --with-nth=2.. | \
    cut -f1)

  [[ -n "$selection" ]] && cd "$selection" || return
}
