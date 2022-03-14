#!/usr/bin/env bash
# Run yarn on all directories with a package.json

for i in $(find ~/dev -maxdepth 2 -name package.json -type f); do
  DIR=$(dirname $i)
  echo "----- $DIR -----"
  yarn --cwd "$DIR" install
done
