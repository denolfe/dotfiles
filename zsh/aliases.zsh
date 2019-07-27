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

# Global Aliases
alias -g H='| head'
alias -g T='| tail'
alias -g G='| grep'
alias -g NUL='&> /dev/null'
alias -g J='| python -m json.tool'
alias -g CD='&& $_'

# Prompt if overwriting
alias cp='cp -i'
alias mv='mv -i'

alias sudo='sudo '

hs(){ history | grep -i "$1" ;}
alias .f='cd ~/.dotfiles'

ff(){ find . -type f -name "$1" ;}
fd(){ find . -type d -name "$1" ;}

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
		alias -g C='| xclip -selection c'
		alias pbcopy='xclip -selection c'
		alias pbpaste='xclip -selection clipboard -o'
    ;;
  'Darwin')
		alias -g C='| pbcopy'
    ;;
  *) ;;
esac

# Other bash stuff
alias t="touch"
alias cat="bat"
alias tr1='tree -L 1 -C'
alias tr2='tree -L 2 -C'
alias tr3='tree -L 3 -C'

# Zshmarks ==> Bashmarks
alias g="jump"
alias s="bookmark"
alias d="deletemark"
alias p="showmarks"
alias l="showmarks"
