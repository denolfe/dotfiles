#!/usr/bin/env bash
#
# Zsh only aliases

alias -g H='| head'
alias -g T='| tail'
alias -g G='| grep'
alias -g Gi='| grep -i'
alias -g NUL='&> /dev/null'
alias -g CD='&& $_'
alias -g F='| fzf'

# Detect the platform (similar to $OSTYPE)
OS="`uname`"
case $OS in
  'Linux')
		alias -g C='| xclip -selection c'
    ;;
  'Darwin')
		alias -g C='| pbcopy'
    ;;
  *) ;;
esac

# Zshmarks ==> Bashmarks
alias g="jump"
alias s="bookmark"
alias d="deletemark"
alias p="showmarks"
alias l="showmarks"
