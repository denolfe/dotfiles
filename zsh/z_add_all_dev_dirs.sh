#!/usr/bin/env bash
# Add all git directories to z suggestions
# Only works copy-pasted

for i in $(find ~/dev -maxdepth 3 -name .git -type d); do
  # z --add ${i:h}
  echo ${i:h}
done
