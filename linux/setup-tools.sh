#!/usr/bin/env bash
#
# Install essential CLI tools via mise

# Install into $HOME so mise survives immutable-OS updates (SteamOS replaces /usr)
if ! command -v mise > /dev/null 2>&1; then
  echo "Installing mise to ~/.local/bin..."
  curl -fsSL https://mise.run | sh
  export PATH="$HOME/.local/bin:$PATH"
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
