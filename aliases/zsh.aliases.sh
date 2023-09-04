#!/usr/bin/env bash

alias rl='source ~/.zshrc; echo ".zshrc reloaded"'
alias regen='zgenom reset;source ~/.zshrc'

# Main directories
alias .f='cd ~/.dotfiles'
alias .d='cd ~/dev'

# Karabiner seems to be fiddly with CapsLock state on wake, so this is a way to restart it while spamming CapsLock.
# New keyboard blinks when CapsLock is enabled, so this is a quick way to fix.
alias rk="launchctl stop org.pqrs.karabiner.karabiner_console_user_server;sleep 2;launchctl start org.pqrs.karabiner.karabiner_console_user_server"

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

alias ca='code -a'

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

# tree w/ .gitignore - https://unix.stackexchange.com/a/632196
alias tr1='rg --files | tree --fromfile -L 1 -C'
alias tr2='rg --files | tree --fromfile -L 2 -C'
alias tr3='rg --files | tree --fromfile -L 3 -C'
alias trall='rg --files | tree --fromfile -C'

if type bat > /dev/null 2>&1; then
  alias cat="bat"
fi

# cd into the most recently modified directory
alias cdd='cd $(ls -v1td */ | head -1)'
alias to_lower="tr '[:upper:]' '[:lower:]'"
alias to_upper="tr '[:lower:]' '[:upper:]'"

if type rg > /dev/null 2>&1; then
  alias rg="rg -i --hidden -g '!.git/'"
  alias rgf="rg --files | rg"
fi

if type terminal-notifier > /dev/null 2>&1; then
  # notify alias with iterm2 icon
  alias notify="terminal-notifier -title 'ZSH' -sound funk -message"
fi

alias jwt_from_clip="pbpaste | jwt decode -j - | jq -r '.payload'"
alias jqkeys="jq -r 'select(objects)|=[.] | map( paths(scalars) ) | map( map(select(numbers)=\"[]\") | join(\".\")) | unique | .[]' | sed 's/.\[\]/[]/g' | xargs printf -- '.%s\n'"