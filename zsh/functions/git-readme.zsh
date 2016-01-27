#!/usr/bin/env bash
#
# Generate new README.md

git-readme() {
	if [ -f ./README.md ]; then echo "README.md already exists"; return; fi
	if [ -z "$1" ]; then echo "Please provide project name"; return; fi

	sed "s/Project Name/$1/g" "$DF/git/README.template" > README.md
	echo "README.md file generated."
}
