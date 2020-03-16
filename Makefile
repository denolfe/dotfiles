.PHONY: install karabiner macos brew brew-restore

default:
	@echo "Please choose one of the following targets: karabiner, vscode-install, vscode-save"
	@exit 2

# Run dotbot install script
install:
	./install

# Generate karabiner.json from jsonnet
karabiner:
	jsonnet karabiner/karabiner.jsonnet -o karabiner/karabiner.json
	launchctl stop org.pqrs.karabiner.karabiner_console_user_server
	sleep 0.2
	launchctl start org.pqrs.karabiner.karabiner_console_user_server

# Install extensions from vscode/extensions.txt
vscode-install:
	cat ${DOTFILES}/vscode/extensions.txt | xargs -L 1 code --install-extension

# Save all current extensions to vscode/extensions.txt
vscode-save:
	code --list-extensions > ${DOTFILES}/vscode/extensions.txt

# Save snapshot of all brew packages to macos/Brewfile
brew:
	brew bundle dump -f --file=macos/Brewfile
	brew bundle --force cleanup --file=macos/Brewfile

brew-restore:
	/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
	brew update
	brew upgrade
	brew install mas
	brew bundle install --file=macos/Brewfile
	brew cleanup

# Set MacOS defaults
macos:
	./macos/set-defaults.sh
