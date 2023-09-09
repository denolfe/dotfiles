#!/usr/bin/env bash
#
# Clone and yarn

gcly() {
  git clone --recurse-submodules "$@"
  cd "$(ls -v1td */ | head -1)" || return
  yarn
}
