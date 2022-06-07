#!/usr/bin/env bash
#
# 'Choose workspace'
# Shows a workspace chooser using fzf

cws() {
  local ws_dir ext
  ws_dir="$HOME"/dev
  ext=".code-workspace"
  find $ws_dir/*$ext -exec basename {} \; | \
  sed -r "s/$ext//" | \
  fzf --height 30% --prompt "Select Workspace >" --preview-window 75% --preview "bat $ws_dir/{}.code-workspace | jq -r '.folders[].path' | sort" | \
  xargs -I {} code $ws_dir/{}$ext
}
