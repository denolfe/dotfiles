#!/usr/bin/env bash

# Replace http:// with discord:// to open discord links in the app
discord() {
  local url="${1/https/discord}"
  echo "opening $url..."
  open "$url"
}
