#!/usr/bin/env bash
#
# docker aliases

alias dstopall='docker stop $(docker ps -a -q)'
alias dps='docker ps -a'
alias dip='docker-machine ip default'
