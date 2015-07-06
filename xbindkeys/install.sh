DEPS="xbindkeys xbindkeys-config xdotool wmctrl"

installed () {
  printf "\r\033[0m  [ \033[00;32mINSTALLED\033[0m ] $1\n"
}

missing () {
  printf "\r\033[2K  [  \033[0;31mMISSING\033[0m  ] $1\n"
}

installing () {
  printf "\033[00;37m  Installing $1... "
}

installing_done () {
	printf "\033[0m [\033[00;32mDONE\033[0m]\n"
}

for dep in $DEPS
do
	if [ -x "$(command -v $dep)" ]; then
		installed "$dep"
	else
		missing "$dep"
		installing "$dep"
		sudo apt-get -qq install $dep > /dev/null
		installing_done
	fi
done

echo ''
echo '  Dependencies installed!'
