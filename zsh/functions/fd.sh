#!/usr/bin/env bash

# Another fd - cd into the selected directory
# This one differs from the above, by only showing the sub directories and not
#  showing the directories within those.
fd() {
  depth="$1"
  if [ -z "$1" ]; then
    depth=0
  fi
  DIR=`find * -maxdepth $depth -type d -print 2> /dev/null | fzf` \
    && cd "$DIR"
}
