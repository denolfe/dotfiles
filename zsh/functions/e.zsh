# Pantheon-files without junk in terminal
e() {
	pantheon-files $* >/dev/null 2>&1 &|
}
