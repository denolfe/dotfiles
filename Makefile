.PHONY: install link karabiner karabiner-dev vscode-install vscode-save brew brew-restore macos claude claude-plugins claude-plugin-refresh claude-verbs tmux

# Run dotbot install script
install:
	./install

link:
	./install --only link

# Build and output karabiner.json
karabiner:
	bun run karabiner/karabiner.ts

karabiner-dev:
	bun --watch karabiner/karabiner.ts

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

# Installs and enables Claude Code settings and plugins
claude:
	./claude/set-defaults.sh

# Sync Claude Code local plugins
claude-plugins:
	./claude/update-local-plugins.sh

# Wipe and re-sync one local plugin's install cache (usage: make claude-plugin-refresh PLUGIN=tmux-agent-status)
claude-plugin-refresh:
ifndef PLUGIN
	$(error PLUGIN required: make claude-plugin-refresh PLUGIN=<name>)
endif
	./claude/refresh-local-plugin.sh $(PLUGIN)

# Install tpm and tmux plugins (idempotent)
tmux:
	@test -d ~/.tmux/plugins/tpm || git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
	~/.tmux/plugins/tpm/bin/install_plugins

gitleaks-history:
	gitleaks detect --no-git --log-level fatal -f json --no-color --no-banner --redact --source ~/.zsh_history -r ~/.report_gitleaks.json
	code -a ~/.report_gitleaks.json

# Set Claude spinner verbs (usage: make claude-verbs [THEME=scifi|peanut]; defaults to scifi)
THEME ?= scifi
claude-verbs:
ifeq ($(filter $(THEME),scifi peanut),)
	$(error THEME must be 'scifi' or 'peanut')
endif
	jq --slurpfile verbs ${DOTFILES}/claude/verbs-$(THEME).json '.spinnerVerbs.verbs = $$verbs[0]' ~/.claude/settings.json > ~/.claude/settings.json.tmp && mv ~/.claude/settings.json.tmp ~/.claude/settings.json
