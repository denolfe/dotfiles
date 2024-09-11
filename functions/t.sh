#!/usr/bin/env bash

# touch with mkdir -p
t() {
  mkdir -p "$(dirname "$1")" && touch "$1"
  echo "Created: $1"
}
