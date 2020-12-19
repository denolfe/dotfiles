# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

#!/usr/bin/env bash
# Get zgen
source ~/.zgen/zgen.zsh

export DOTFILES="$HOME/.dotfiles"

# Generate zgen init.sh if it doesn't exist
if ! zgen saved; then
    zgen oh-my-zsh

    # Plugins
    zgen oh-my-zsh plugins/git
    zgen oh-my-zsh plugins/github
    zgen oh-my-zsh plugins/sudo
    zgen oh-my-zsh plugins/command-not-found
    zgen oh-my-zsh plugins/kubectl
    zgen oh-my-zsh plugins/docker
    zgen oh-my-zsh plugins/docker-compose
    zgen load michaelaquilina/zsh-autoswitch-virtualenv
    zgen load zsh-users/zsh-syntax-highlighting
    zgen load jocelynmallon/zshmarks
    zgen load caarlos0/zsh-mkc
    zgen load caarlos0/zsh-git-sync
    zgen load caarlos0/zsh-add-upstream
    zgen load denolfe/zsh-travis
    zgen load denolfe/zsh-prepend

    zgen load agkozak/zsh-z
    zgen load andrewferrier/fzf-z

    zgen oh-my-zsh plugins/asdf
    zgen load kiurchv/asdf.plugin.zsh

    # These 2 must be in this order
    zgen load zsh-users/zsh-syntax-highlighting
    zgen load zsh-users/zsh-history-substring-search

    # Set keystrokes for substring searching
    zmodload zsh/terminfo
    bindkey "$terminfo[kcuu1]" history-substring-search-up
    bindkey "$terminfo[kcud1]" history-substring-search-down
    bindkey "^k" history-substring-search-up
    bindkey "^j" history-substring-search-down

  	# Warn you when you run a command that you've got an alias for
    zgen load djui/alias-tips

    # Completion-only repos
    zgen load zsh-users/zsh-completions src

    # Theme
    POWERLEVEL9K_MODE='nerdfont-complete'
    zgen load romkatv/powerlevel10k powerlevel10k

    # Generate init.sh
    zgen save
fi

source $DOTFILES/.p10k.zsh

# History Options
setopt append_history
setopt extended_history
setopt hist_expire_dups_first
setopt hist_ignore_all_dups
setopt hist_ignore_dups
setopt hist_ignore_space
setopt hist_reduce_blanks
setopt hist_save_no_dups
setopt hist_verify

# Share history across all your terminal windows
setopt share_history
#setopt noclobber

# set some more options
setopt pushd_ignore_dups
#setopt pushd_silent

# Increase history size
HISTSIZE=100000
SAVEHIST=100000
HISTFILE=~/.zsh_history
export HISTIGNORE="ls:cd:cd -:pwd:exit:date:* --help"

# Return time on long running processes
REPORTTIME=2
TIMEFMT="%U user %S system %P cpu %*Es total"

# Place to stash environment variables
if [[ -a ~/.secrets ]]
then
  source ~/.secrets
fi

# Load functions
for f in $DOTFILES/functions/*; do source $f; done

# Load aliases
for f in $DOTFILES/aliases/*.aliases.*sh; do source $f; done

# Load all path files
for f in $DOTFILES/path/*.path.sh; do source $f; done

if type fd > /dev/null 2>&1; then
  export FZF_DEFAULT_COMMAND='fd --type f'
fi

export FZF_DEFAULT_OPTS='--reverse --bind 'ctrl-l:cancel''
export FZF_TMUX_HEIGHT=80%
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh

export BAT_THEME='Monokai Extended Bright'

export AWS_PAGER='bat -p'

# Needed for Crystal on mac - openss + pkg-config
if [ `uname` = Darwin ]; then
  export PKG_CONFIG_PATH=$PKG_CONFIG_PATH:/usr/local/opt/openssl/lib/pkgconfig
fi

source ~/.asdf/asdf.sh
source ~/.asdf/completions/asdf.bash
