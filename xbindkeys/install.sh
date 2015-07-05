DEPS="xbindkeys xbindkeys-config xdotool wmctrl"

for dep in $DEPS
do
	if [ -x "$(command -v $dep)" ]; then
		echo "$dep installed"
	else
		echo "Installing $dep..."
		sudo apt-get -qq install $dep
	fi
done