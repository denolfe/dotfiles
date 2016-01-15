function apt-remove-dep() {
  sudo aptitude markauto $(apt-cache showsrc $1 | sed -e '/Build-Depends/!d;s/Build-Depends: \|,\|([^)]*),*\|\[[^]]*\]//g')""
}

alias sard=apt-remove-dep
