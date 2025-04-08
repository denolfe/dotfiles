#!/usr/bin/env bash
# shellcheck disable=SC2016

# Name
git config --global user.name "Chase Stephens"
git config --global user.email 'chasestephens@92.com'

# Set git global settings
git config --global core.autocrlf false
git config --global core.whitespace cr-at-eol
git config --global push.default current
git config --global push.autoSetupRemote true
git config --global push.followTags true
git config --global pull.rebase true
git config --global rebase.autoStash true
git config --global status.short true
git config --global status.branch true
git config --global branch.autoSetupMerge true
git config --global init.defaultBranch main

# Set aliases in .gitconfig
git config --global alias.last 'log -1 HEAD'
git config --global alias.unstage 'reset HEAD --'
git config --global alias.hist 'log --oneline --graph --decorate --all'
git config --global alias.stu 'status -uno'
git config --global alias.st 'status'
git config --global alias.unp 'log origin/master..HEAD'
git config --global alias.subup 'submodule update --remote --merge'
git config --global alias.aliases "config --get-regexp '^alias\.'"
git config --global alias.pom 'push origin master'
git config --global alias.undolast 'reset HEAD~1'
git config --global alias.revertlast 'revert HEAD'
git config --global alias.editlast 'commit --amend -m'
git config --global alias.pr '!f() { git fetch -fu ${2:-$(git remote |grep ^upstream || echo origin)} refs/pull/$1/head:pr/$1 && git checkout pr/$1; }; f'
git config --global alias.pr-clean '!git for-each-ref refs/heads/pr/* --format="%(refname)" | while read ref ; do branch=${ref#refs/heads/} ; git branch -D $branch ; done'
git config --global alias.fzau '!git ls-files -m --exclude-standard | fzf -m --print0 --preview-window down,90% --preview "git diff $@ -- {-1} | delta" | xargs -0 -o -t git add -p'
git config --global alias.fza '!git ls-files -m -o --exclude-standard | fzf -m --print0 --preview-window down,90% --preview "git diff $@ -- {-1} | delta" | xargs -0 -o -t git add -p'
git config --global alias.authors 'shortlog -s -n -e --all --no-merges'

## Find most recent common ancestor between HEAD and another branch
git config --global alias.find-base '!f() { git merge-base HEAD $1 | xargs git l3; }; f'

# Fancy Logs
git config --global alias.l 'log --oneline --graph --decorate --all'
git config --global alias.l1 "log --graph --abbrev-commit --decorate --date=relative --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(blue)<%an>%Creset%C(yellow)%d%Creset' --all"
git config --global alias.l2 "log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold cyan)%aD%C(reset) %C(bold green)(%ar)%C(reset)%C(bold yellow)%d%C(reset)%n''          %C(white)%s%C(reset) %C(dim white)- %an%C(reset)' --all"
git config --global alias.l3 "log --abbrev=7 --format='%C(bold cyan)%h%Creset %s %Cgreen(%cr) %C(blue)<%<(8,trunc)%an>%Creset%C(yellow)%d%Creset'"

# Zsh plugins
git config --global alias.editlast "commit --amend -m" # Make sure to unstage all first!
git config --global alias.sync "!zsh -ic git-sync"
git config --global alias.add-upstream "!zsh -ic add-upstream"
git config --global alias.trav "!zsh -ic git-trav"

if [[ -z $(git config --global --get user.email) ]]; then
  START="\033[96m\033[1m"
  END="\033[0m"
  echo -e "!!!\n\n${START}Git Email not set, please configure!\n\ngit config --global user.email 'test@email.com'\n\n!!!${END}"
fi

# Delta

git config --global pager.diff delta
git config --global pager.log delta
git config --global pager.reflog delta
git config --global pager.show delta

git config --global delta.plus-style 'syntax #012800'
git config --global delta.plus-emph-style 'syntax #1B421A'
git config --global delta.minus-style 'syntax #340001'
git config --global delta.minus-emph-style 'syntax #4E1A1B'

git config --global delta.file-decoration-style 'blue box'
git config --global delta.hunk-header-style 'omit'

git config --global delta.navigate 'syntax #340001'
git config --global delta.navigate true
git config --global delta.syntax-theme 'Solarized (dark)'
git config --global delta.line-numbers true

git config --global interactive.diffFilter 'delta --color-only'
