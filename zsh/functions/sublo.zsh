#!/usr/bin/env bash
#
# Create file then open in Sublime
sublo() {
	if [ -z "$1" ]
	then
		echo "Missing file parameter"
	else
		touch "$1"
		subl "$1"
		echo "$1 created"
	fi
}