#!/bin/sh
# mkdir and cd to it
mkc() {
  mkdir -p "$1" && cd "$1" || return 1
}

_mkc() {
  #compdef mkc
  _files -W "$1" -/
}
