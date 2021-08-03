#!/usr/bin/env bash

# Needed for asdf to work with global packages
# https://github.com/asdf-vm/asdf-nodejs/issues/42#issuecomment-386783059

export PATH="$PATH:$HOME/.yarn/bin"
