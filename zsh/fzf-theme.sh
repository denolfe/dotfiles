# Base16 Solarized Dark
# Author: Ethan Schoonover (modified by aramisgithub)
# https://github.com/fnune/base16-fzf/blob/master/bash/base16-solarized-dark.config
# shellcheck disable=SC1000-SC9999

_gen_fzf_default_opts() {

local color00='#002b36'
local color01='#073642'
local color02='#586e75'
local color03='#657b83'
local color04='#839496'
local color05='#93a1a1'
local color06='#eee8d5'
local color07='#fdf6e3'
local color08='#dc322f'
local color09='#cb4b16'
local color0A='#b58900'
local color0B='#859900'
local color0C='#2aa198'
local color0D='#268bd2'
local color0E='#6c71c4'
local color0F='#d33682'

export FZF_DEFAULT_OPTS="$FZF_DEFAULT_OPTS"\
" --color=bg+:$color01,bg:$color00,spinner:$color0D,hl:$color0B"\
" --color=fg:$color04,header:$color0B,info:$color0A,pointer:$color0D"\
" --color=marker:$color0D,fg+:$color06,prompt:$color0A,hl+:$color0B"

}

_gen_fzf_default_opts
