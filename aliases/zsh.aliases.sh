#!/usr/bin/env bash

alias rl='source ~/.zshrc; echo ".zshrc reloaded"'
alias regen='zgen reset;source ~/.zshrc'

alias ll='ls -la'
alias llt='ls -lat'

alias senable='sudo systemctl enable'
alias srestart='sudo systemctl restart'
alias sstatus='sudo systemctl status'
alias sstop='sudo systemctl stop'
alias sstart='sudo systemctl start'

# Easier navigation
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias .....='cd ../../../..'
alias .2='cd ../..'
alias .3='cd ../../..'
alias .4='cd ../../../..'
alias .5='cd ../../../../..'
alias ~='cd ~/'

# Prompt if overwriting
alias cp='cp -i'
alias mv='mv -i'

alias sudo='sudo '

hs(){ history | grep -i "$1" ;}
alias .f='cd ~/.dotfiles'

# Detect the platform (similar to $OSTYPE)
OS="`uname`"
case $OS in
  'Linux')
		alias ls='ls --color=auto -p'
		alias sagi='sudo apt-get install'
		alias sai='sudo apt install'
		alias sagu='sudo apt-get update'
		alias saar='sudo add-apt-repository'
		alias sagr='sudo apt-get remove'
		alias pbcopy='xclip -selection c'
		alias pbpaste='xclip -selection clipboard -o'
    ;;
  'Darwin')
    ;;
  *) ;;
esac

# Other bash stuff
alias t="touch"
alias tr1='tree -L 1 -C'
alias tr2='tree -L 2 -C'
alias tr3='tree -L 3 -C'

if type bat > /dev/null 2>&1; then
	alias cat="bat"
fi
