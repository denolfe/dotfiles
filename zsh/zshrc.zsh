# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# Get zgen
source ~/.zgenom/zgenom.zsh

export DOTFILES="$HOME/.dotfiles"
export XDG_CONFIG_HOME="$HOME/.config"
export GPG_TTY=$TTY # https://unix.stackexchange.com/a/608921

# Override compdump name: https://github.com/jandamm/zgenom/discussions/121
export ZGEN_CUSTOM_COMPDUMP="~/.zcompdump-$(whoami).zwc"

# Generate zgen init.sh if it doesn't exist
if ! zgenom saved; then
    zgenom ohmyzsh

    # Plugins
    zgenom ohmyzsh plugins/git
    zgenom ohmyzsh plugins/github
    zgenom ohmyzsh plugins/sudo
    zgenom ohmyzsh plugins/command-not-found
    zgenom ohmyzsh plugins/z
    zgenom load zsh-users/zsh-autosuggestions
    zgenom load jocelynmallon/zshmarks
    zgenom load denolfe/git-it-on.zsh
    zgenom load caarlos0/zsh-mkc
    zgenom load caarlos0/zsh-git-sync
    zgenom load caarlos0/zsh-add-upstream
    zgenom load denolfe/zsh-prepend

    zgenom load andrewferrier/fzf-z
    zgenom load reegnz/jq-zsh-plugin

    zgenom ohmyzsh plugins/mise

    zgenom load ntnyq/omz-plugin-pnpm

    # These 2 must be in this order
    zgenom load zsh-users/zsh-syntax-highlighting
    zgenom load zsh-users/zsh-history-substring-search

    # Set keystrokes for substring searching
    zmodload zsh/terminfo
    bindkey "$terminfo[kcuu1]" history-substring-search-up
    bindkey "$terminfo[kcud1]" history-substring-search-down
    bindkey "^k" history-substring-search-up
    bindkey "^j" history-substring-search-down

    zgenom load MichaelAquilina/zsh-you-should-use

    # Modified globalias plugin
    zgenom load $DOTFILES/zsh/globalias.plugin.zsh

    # Completion-only repos
    zgenom load zsh-users/zsh-completions src

    # Theme
    zgenom load romkatv/powerlevel10k powerlevel10k

    # Generate init.sh
    zgenom save
fi

source $DOTFILES/zsh/p10k.zsh
source $DOTFILES/zsh/p10k.customizations.zsh
source $DOTFILES/zellij/zellij.zsh

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
setopt inc_append_history

# Share history across all your terminal windows
setopt share_history
#setopt noclobber

# set some more options
setopt pushd_ignore_dups
#setopt pushd_silent

# Experimental setopt
setopt auto_cd
setopt complete_in_word
setopt interactive_comments

# Increase history size
HISTSIZE=1000000000000000000
SAVEHIST=1000000000000000000
HISTFILE=~/.zsh_history
export HISTORY_IGNORE="ls:cd:cd -:pwd:exit:date:* --help:gl:gst:gd:gro"

# Return time on long running processes
REPORTTIME=2
TIMEFMT="%U user %S system %P cpu %*Es total"

# Source local zshrc if exists
test -f ~/.zshrc.local && source ~/.zshrc.local

# Place to stash environment variables
test -f ~/.secrets && source ~/.secrets

# Load aliases
for f in $DOTFILES/aliases/*.aliases.*sh; do source $f; done

# Load functions
for f in $DOTFILES/functions/*.sh; do source $f; done


# Load all path files
for f in $DOTFILES/path/*.path.sh; do source $f; done

if type fd > /dev/null 2>&1; then
  export FZF_DEFAULT_COMMAND='fd --type f'
fi

export FZF_SHARED_OPTS="\
  --bind 'ctrl-l:cancel' \
  --bind 'ctrl-p:toggle-preview' \
  --bind 'ctrl-z:toggle-wrap' \
  --preview-window up:5:hidden:wrap \
  --wrap-sign '↳ '"

# FZF config and theme
export FZF_DEFAULT_OPTS="\
  --reverse \
  --height=90% \
  --info inline-right \
  --highlight-line \
  --pointer ▌ \
  --prompt '▌ ' \
  --scrollbar='▌' \
  --marker ▏ \
  --padding 1,2 \
  --ellipsis='…' \
  $FZF_SHARED_OPTS"

source $DOTFILES/zsh/fzf-theme-dark-plus.sh

export FZF_CTRL_R_OPTS="\
  --preview 'echo {} | bat --color=always --style=snip --language=zsh' \
  $FZF_SHARED_OPTS"

export FZF_TMUX_HEIGHT=80%
source <(fzf --zsh)

export EZA_ICON_SPACING=2

export BAT_THEME='Visual Studio Dark+'

export AWS_PAGER='bat -p'

export ZSH_PLUGINS_ALIAS_TIPS_REVEAL_TEXT="❯ "

export ZSH_DISABLE_COMPFIX=true

export YSU_MESSAGE_FORMAT="$(tput bold)$(tput setaf 4)Alias tip: %alias$(tput sgr0)"

# Needed for Crystal on mac - openss + pkg-config
if [ `uname` = Darwin ]; then
  export PKG_CONFIG_PATH=$PKG_CONFIG_PATH:/usr/local/opt/openssl/lib/pkgconfig
fi

source /opt/homebrew/share/zsh/site-functions

# pnpm
export PNPM_HOME="$HOME/.pnpm-global"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end

# tabtab source for packages
# uninstall by removing these lines
[[ -f ~/.config/tabtab/zsh/__tabtab.zsh ]] && . ~/.config/tabtab/zsh/__tabtab.zsh || true

# if mise is installed, activate it
if command -v mise >/dev/null 2>&1; then
  eval "$(mise activate zsh)"
fi
