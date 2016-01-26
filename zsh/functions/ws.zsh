#!/usr/bin/env bash
#
# Set Elementary OS workspaces
ws() {
	help="\n    Usage: ws <num>\n\n    0      Enable Dynamic Workspaces\n    1-9    Set number of workspaces\n"
	if [ -z "$1" ]
	then
		echo "$help"
	elif [[ "$1" == "0" ]]; then
		gsettings set org.pantheon.desktop.gala.behavior dynamic-workspaces true
		echo "Dynamic workspaces turned on"
	elif [[ "$1" =~ ^[1-9]+$ ]]; then
		gsettings set org.pantheon.desktop.gala.behavior dynamic-workspaces false
		gsettings set org.gnome.desktop.wm.preferences num-workspaces "$1"
		echo "Workspaces set to $1"
	else
		echo "$help"
	fi
}