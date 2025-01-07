#!/usr/bin/env bash
#
# Some additional git aliases
# Modeled after patterns established by: https://github.com/ohmyzsh/ohmyzsh/blob/master/plugins/git/git.plugin.zsh

alias gst="git status"
alias gau="git add -u"
alias gbd="git branch -D"
alias gbm="git branch --merged"
alias gbmv="git branch -m"
alias gbnm="git branch --no-merged"
alias gbu="git branch -u"
alias gbv="git for-each-ref --sort=-committerdate refs/heads/ --format='%(HEAD) %(color:cyan)%(refname:short)%(color:reset) - %(contents:subject) - (%(color:yellow)%(committerdate:relative)%(color:reset))'"
alias gbvv="git branch -vv"
alias gcane="git commit --amend --no-edit"
alias gcof="git checkout -f"
alias gct="git checkout -t"
alias gdc="git diff --cached"
alias gdlast="git diff HEAD~1..HEAD"
alias gdno="git diff --name-only"
alias gltags="gl --no-walk --tags"
alias glast="git log -1 HEAD"
alias ggpushfwl="ggpush --force-with-lease"
alias gpdel="git push --delete"
alias gpl="git pull"
alias gstu="git status -uno"
alias gstaum="git stash push -u -m"
alias gstam="git stash push -m"
alias gshno="git show --name-only"

alias gswm='git switch $(git_main_branch)'

alias gundo="git reset HEAD~1"
alias guns="git reset HEAD --"

alias gstl="git stash list --pretty=format:'%C(blue)%gd%C(reset): %<(100,trunc)%s %C(green)(%cr)%C(reset)'"

# Remove 'gl' alias from zsh plugin
unalias gl
