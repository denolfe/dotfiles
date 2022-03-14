#!/usr/bin/env bash
# Install all nodejs versions found via .nvmrc files with asdf

echo "----- INSTALLING NODEJS VERSIONS -----"
find ~/dev -maxdepth 3 -name .nvmrc -type f | xargs sed 's/^v//' | xargs -L 1 asdf install nodejs
