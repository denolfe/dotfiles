#!/usr/bin/env bash
#
# Install essential CLI tools via mise

if ! command -v mise > /dev/null 2>&1; then
  echo "mise not found, skipping CLI tool install."
  exit 0
fi

TOOLS=(
  "fzf"
  "fd"
  "bat"
  "eza"
  "ripgrep"
  "delta"
  "jq"
  "gh"
  "neovim"
)

echo "Installing CLI tools via mise..."
mise use -g "${TOOLS[@]}"
echo "All CLI tools installed."
