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
      # Prevent additional vs code icon in dock
      # https://github.com/microsoft/vscode/issues/60579#issuecomment-434583718
      open -b com.microsoft.VSCode "$@"
      ;;
    esac
  }
fi
