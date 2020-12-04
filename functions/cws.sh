#!/usr/bin/env bash

cws() {
  ls $HOME/dev/*.code-workspace | \
  fzf --height 30% --header "-- Select Code Workspace to open --" | \
  xargs code
}
