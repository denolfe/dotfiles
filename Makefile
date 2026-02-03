.PHONY: install link karabiner karabiner-dev phoenix phoenix-dev vscode-install vscode-save brew brew-restore macos claude claude-plugins

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

phoenix-dev:
	pnpm -C phoenix run dev

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

# Set Claude Code defaults
claude:
	./claude/set-defaults.sh

# Update and install Claude Code local plugins
claude-plugins:
	./claude/update-local-plugins.sh

gitleaks-history:
	gitleaks detect --no-git --log-level fatal -f json --no-color --no-banner --redact --source ~/.zsh_history -r ~/.report_gitleaks.json
	code -a ~/.report_gitleaks.json
