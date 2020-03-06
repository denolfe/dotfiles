.PHONY: karabiner

default:
	@echo "Please choose one of the following targets: karabiner, vscode-install, vscode-save"
	@exit 2

# Generate karabiner.json from jsonnet
karabiner:
	jsonnet karabiner/karabiner.jsonnet -o karabiner/karabiner.json

# Install extensions from vscode/extensions.txt
vscode-install:
	cat ${DOTFILES}/vscode/extensions.txt | xargs -L 1 code --install-extension

# Save all current extensions to vscode/extensions.txt
vscode-save:
	code --list-extensions > ${DOTFILES}/vscode/extensions.txt

# Save snapshot of all brew packages to macos/Brewfile
brew:
	brewfile > macos/Brewfile
