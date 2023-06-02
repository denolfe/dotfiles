# Base16 Solarized Dark
# Author: Ethan Schoonover (modified by aramisgithub)
# https://github.com/fnune/base16-fzf/blob/master/bash/base16-solarized-dark.config
# shellcheck disable=SC1000-SC9999

_gen_fzf_default_opts() {

local color00='#1e1e1e'
local color01='#3A3D41'
local color04='#cccccc'
local color06='#feffff'
local color0A='#3b8eea'
local color0B='#0dbc79'
local color0D='#3b8eea'
local hlPlus='#23d18b'

export FZF_DEFAULT_OPTS="$FZF_DEFAULT_OPTS"\
" --color=bg+:$color01,bg:$color00,spinner:$color0D,hl:$color0B"\
" --color=fg:$color04,header:$color0B,info:$color0A,pointer:$color0D"\
" --color=marker:$color0D,fg+:$color06,prompt:$color0A,hl+:$hlPlus"
}

_gen_fzf_default_opts
