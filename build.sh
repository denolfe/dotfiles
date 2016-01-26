#!/usr/bin/env bash
#
# Custom ShellCheck build script

source ./_build/build.sh

find . -name '*.zsh' -type f | egrep -v "oh-my-zsh" | egrep -v "zgen.symlink" | while read zshfile
do
  check "$zshfile"
done
