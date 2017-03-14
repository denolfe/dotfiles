#!/usr/bin/env bash
#
# Install Rvm

source "$(dirname "$0")"/../_script/logging

header "Ruby"

if ! test "$(which gpg)"; then
  brew install gnupg2 &> /dev/null
fi

if test "$(which rvm)"; then
  success rvm
else
  installing rvm
  gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
  curl -sSL https://get.rvm.io | bash
  installing_done
fi
