#!/usr/bin/env bash
#
# Install Rvm

if ! test "$(which gpg)"; then
  brew install gnupg2
fi

gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
curl -sSL https://get.rvm.io | bash
