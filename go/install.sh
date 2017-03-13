#!/usr/bin/env bash
#
# Install Go

source "$(dirname "$0")"/../_script/logging

if [ "$(uname -s)" != "Darwin" ]; then
  exit 0
fi

if ! test "$(which go)"; then
  brew install go
  success "Install Go"
fi
