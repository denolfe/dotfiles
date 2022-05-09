#!/usr/bin/env bash

cws() {
  local ws_dir
  ws_dir="$HOME"/dev
  find "$ws_dir"/*.code-workspace -exec basename {} \; | \
  fzf --height 30% --prompt "Select Workspace >" --preview "bat $ws_dir/{} | jq -r '.folders[].path' | sort" | \
  xargs -I {} code "$ws_dir"/{}
}
