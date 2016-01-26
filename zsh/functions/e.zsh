#!/usr/bin/env bash
#
# Pantheon-files without junk in terminal

# shellcheck disable=SC1073
e() {
	pantheon-files "$*" >/dev/null 2>&1 & disown
	# pantheon-files "$*" >/dev/null 2>&1 &|
}
