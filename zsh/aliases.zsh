#!/usr/bin/env bash

alias rl='source ~/.zshrc; echo ".zshrc reloaded"'
alias regen='zgen reset;source ~/.zshrc'

alias ls='ls -GFHp'
alias ll='ls -la'

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
alias -g C='| pbcopy'
alias -g J='| python -m json.tool'

# Prompt if overwriting
alias cp='cp -i'
alias mv='mv -i'

alias sudo='sudo '

hs(){ history | grep -i "$1" ;}
alias .f='cd ~/.dotfiles'

ff(){ find . -type f -name "$1" ;}
fd(){ find . -type d -name "$1" ;}

if [ "$(uname -s)" = "Linux" ];then
	alias ls='ls --color=auto -p'
	alias sagi='sudo apt-get install'
	alias sagu='sudo apt-get update'
	alias saar='sudo add-apt-repository'
	alias sagr='sudo apt-get remove'
	alias -g C='| xclip -selection c'
  alias pbcopy='xclip -selection c'
	alias pbpaste='xclip -selection clipboard -o'
	alias rsx='sudo killall xbindkeys && sudo xbindkeys && echo "xbindkeys restarted"'
fi

# Other bash stuff
alias mkcd='mkc'
alias sta='st . -a'
alias sto='sublo'

# Apps
alias t="touch"
alias ds="dashing start"
alias djs="dashing-js start"
alias be="bundle exec"
alias mm="middleman"
alias djs="dashing-js start"
alias subla="subl . -a"


# Zshmarks ==> Bashmarks
alias g="jump"
alias s="bookmark"
alias d="deletemark"
alias p="showmarks"
alias l="showmarks"
