#!/usr/bin/env bash
#
# Kill process using specific port

killport() {
	fuser -k "$1"/tcp &> /dev/null
}
