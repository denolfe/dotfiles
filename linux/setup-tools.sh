#!/usr/bin/env bash
#
# Install essential CLI tools via mise

if ! command -v mise > /dev/null 2>&1; then
  echo "mise not found, skipping CLI tool install."
  exit 0
fi

TOOLS=(
  "bat"
  "bun"
  "delta"
  "eza"
  "fd"
  "fzf"
  "gh"
  "jq"
  "neovim"
  "ripgrep"
)

echo "Installing CLI tools via mise..."
mise use -g "${TOOLS[@]}"
echo "All CLI tools installed."
