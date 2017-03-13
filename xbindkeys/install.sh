#!/usr/bin/env bash
source "$(dirname "$0")"/../_script/logging

[ "$(uname -s)" != "Linux" ] && exit 0

header "xbindkeys Dependencies"

check_or_install_dep "xbindkeys"
check_or_install_dep "xdotool"
check_or_install_dep "wmctrl"

# Use this snippet for dependencies that require custom installation steps

# if ! is_installed "xbindkeys"; then
# 	success "xbindkeys"
# else
# 	error "xbindkeys"
# 	# installing "xbindkeys"
# 	# sudo apt-get install xbindkeys -y
# 	# installing_done "xbindkeys"
# fi
