#!/usr/bin/env bash

alias rl='source ~/.zshrc; echo ".zshrc reloaded"'
alias regen='zgenom reset;source ~/.zshrc'
alias .f='cd ~/.dotfiles'

if type exa > /dev/null 2>&1; then
  alias ll='exa -alF --icons --color=always --group-directories-first'
  alias llt='exa -alF --icons --color=always -s=mod --reverse'
else
  alias ll='ls -la'
  alias llt='ls -lat'
fi

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

hs(){ history | grep -i "$1" ;}

# Detect the platform (similar to $OSTYPE)
OS=$(uname)
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

    if type systemctl > /dev/null 2>&1; then
      alias senable='sudo systemctl enable'
      alias srestart='sudo systemctl restart'
      alias sstatus='sudo systemctl status'
      alias sstop='sudo systemctl stop'
      alias sstart='sudo systemctl start'
    fi
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

alias CDD='cd $(ls -v1td */ | head -1)'
alias to_lower="tr '[:upper:]' '[:lower:]'"
alias to_upper="tr '[:lower:]' '[:upper:]'"

if type rg > /dev/null 2>&1; then
  alias rg="rg -i --hidden -g '!.git/'"
  alias rgf="rg --files | rg"
fi

alias jwt_from_clip="pbpaste | jwt decode -j - | jq -r '.payload'"
alias jqkeys="jq -r 'select(objects)|=[.] | map( paths(scalars) ) | map( map(select(numbers)=\"[]\") | join(\".\")) | unique | .[]' | sed 's/.\[\]/[]/g' | xargs printf -- '.%s\n'"