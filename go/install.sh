#!/usr/bin/env bash
#
# Install Go

if [ "$(uname -s)" != "Darwin" ]; then
  exit 0
fi

if ! test "$(which go)"; then
  brew install go
fi
