#!/usr/bin/env bash

cws() {
  ls $HOME/dev/*.code-workspace | \
  fzf --height 30% --prompt "Select Workspace >" | \
  xargs code
}
