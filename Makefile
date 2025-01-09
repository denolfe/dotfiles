.PHONY: install karabiner phoenix macos brew brew-restore phoenix-dev

# Run dotbot install script
install:
	./install

link:
	./install --only link

# Build and output karabiner.json
karabiner:
	deno run --allow-env --allow-read --allow-write karabiner/karabiner.ts

karabiner-dev:
	deno run --watch --allow-env --allow-read --allow-write karabiner/karabiner.ts

# Build and output phoenix config
phoenix:
	pnpm -C phoenix run build

# Install extensions from vscode/extensions.txt
vscode-install:
	cat ${DOTFILES}/vscode/extensions.txt | xargs -L 1 code --install-extension

# Save all current extensions to vscode/extensions.txt
vscode-save:
	code --list-extensions > ${DOTFILES}/vscode/extensions.txt

# Save snapshot of all Homebrew packages to macos/Brewfile
brew:
	brew bundle dump -f --file=macos/Brewfile
	brew bundle --force cleanup --file=macos/Brewfile

# Restore Homebrew packages
brew-restore:
	/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
	brew update
	brew upgrade
	brew install mas
	brew bundle install --file=macos/Brewfile
	brew cleanup

# Set MacOS defaults
macos:
	./macos/set-defaults.sh
