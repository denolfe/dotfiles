#!/usr/bin/env bash

if command -v code >/dev/null 2>&1; then
  code() {
    case "$1" in
    save-ext)
      echo "Saving code extensions..."
      code --list-extensions > $DOTFILES/vscode/extensions.txt
      ;;
    install-ext)
      echo "Installing code extensions..."
      cat $DOTFILES/vscode/extensions.txt | xargs -L 1 code --install-extension
      ;;
    *)
      command code "$@"
      ;;
    esac
  }
fi
