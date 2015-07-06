DEPS="xbindkeys xbindkeys-config xdotool wmctrl"

success () {
  printf "\r\033[2K  [ \033[00;32mINSTALLED\033[0m ] $1\n"
}

fail () {
  printf "\r\033[2K  [  \033[0;31mMISSING\033[0m  ] $1\n"
}

for dep in $DEPS
do
	if [ -x "$(command -v $dep)" ]; then
		success "$dep"
	else
		fail "$dep"
		echo "Installing $dep..."
		sudo apt-get -qq install $dep
	fi
done