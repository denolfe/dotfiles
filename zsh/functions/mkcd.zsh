# mkdir then cd into
mkcd() {
	if [ -z "$1" ]
	then
		echo "Missing folder parameter"
	else
		mkdir "$1"
		cd "$1"
	fi
}