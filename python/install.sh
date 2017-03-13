#!/usr/bin/env bash
#
# Install pip

source ../_script/logging

if [ "$(uname -s)" != "Linux" ];then
  exit 0
fi

header "Python"

if [ -x "$(command -v pip)" ]; then
	success pip
else
	error pip
	installing pip
	sudo curl https://bootstrap.pypa.io/get-pip.py --output /tmp/get-pip.py
	sudo -H python /tmp/get-pip.py
	installing_done
fi

pip_installed() {
	if pip list | grep "$1" &> /dev/null; then
		success "$1"
	else
		error "$1"
		installing "$1"
		sudo -H pip install "$1"
		success "$1"
	fi
}

pip_installed "awscli"
