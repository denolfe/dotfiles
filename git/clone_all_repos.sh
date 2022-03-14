#!/usr/bin/env bash
# Clone all specified repos

cd ~/dev || return 1

REPOS=(
  # Fill out repos here
  "org/repo"
)

for REPO in "${REPOS[@]}"
do
  echo "----- CLONING ----- $REPO"
	git clone git@github.com:"$REPO".git
done
