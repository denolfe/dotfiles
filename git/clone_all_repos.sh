#!/usr/bin/env bash
# Clone all specified repos

# cd into desired directory

cd ~/dev || return

REPOS=(
  # Fill out repos here
  "org/repo"
)

for REPO in "${REPOS[@]}"; do
  echo "----- CLONING ----- $REPO"
  git clone git@github.com:"$REPO".git
done
