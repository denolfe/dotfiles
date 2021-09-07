#!/usr/bin/env bash

cws() {
  find "$HOME"/dev/*.code-workspace | \
  fzf --height 30% --prompt "Select Workspace >" | \
  xargs code
}
