# Fast tree function that takes a level parameter

tr() {
	help="\n    Usage: tr <level>"
	if [ -z $1 ]
	then
		tree -L 1 -C
	elif [[ "$1" =~ ^[1-9]$ ]]; then
		tree -L $1 -C
	fi
}
