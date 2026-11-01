#!/usr/bin/env bash
#
# Install essential CLI tools via mise

should_install_mise() {
  [ -x "$HOME/.local/bin/mise" ] && return 1
  # SteamOS replaces /usr on update, so a pacman-installed mise does not count
  grep -q "^ID=steamos" /etc/os-release 2>/dev/null && return 0
  ! command -v mise > /dev/null 2>&1
}

if should_install_mise; then
  echo "Installing mise to ~/.local/bin..."
  curl -fsSL https://mise.run | sh
fi
export PATH="$HOME/.local/bin:$PATH"

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
