# Set git global settings
git config --global push.default current
git config --global core.autocrlf false
git config --global core.whitespace cr-at-eol
git config --global status.short true
git config --global status.branch true

# Set aliases in .gitconfig
git config --global alias.last 'log -1 HEAD'
git config --global alias.unstage 'reset HEAD --'
git config --global alias.hist 'log --oneline --graph --decorate --all'
git config --global alias.stu 'status -uno'
git config --global alias.st 'status'
git config --global alias.unp 'log origin/master..HEAD'
git config --global alias.subup 'submodule update --remote --merge'
git config --global alias.aliases "config --get-regexp '^alias\.'"

git config --global alias.ignore '!gi() { wget -O .gitignore https://www.gitignore.io/api/$@ --no-check-certificate ;}; gi'

git config --global alias.pom 'push origin master'
git config --global alias.undolast 'reset HEAD~1'
git config --global alias.revertlast 'revert HEAD'
git config --global alias.editlast 'commit --amend -m'
git config --global push.default current

git config --global alias.l 'log --oneline --graph --decorate --all'
git config --global alias.l1 "log --graph --abbrev-commit --decorate --date=relative --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(blue)<%an>%Creset%C(yellow)%d%Creset' --all"
git config --global alias.l2 "log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold cyan)%aD%C(reset) %C(bold green)(%ar)%C(reset)%C(bold yellow)%d%C(reset)%n''          %C(white)%s%C(reset) %C(dim white)- %an%C(reset)' --all"
git config --global alias.l3 "log --format='%C(bold cyan)%h%Creset %s %Cgreen(%cr) %C(blue)<%an>%Creset%C(yellow)%d%Creset'"
