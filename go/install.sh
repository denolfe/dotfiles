#!/usr/bin/env bash
#
# Install Go

if [ "$(uname -s)" != "Darwin" ]; then
  exit 0
fi

brew install go