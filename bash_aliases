alias reload="source .bashrc;echo Bash Reloaded."
alias rl=reload
alias aliases="sed -n '/^alias /p' ~/.bash_aliases"

alias ls='ls --color=auto -p'
alias ll='ls -la'
alias tr='tree -L 1'
alias tr2='tree -L 2'

# Easier navigation
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias .....='cd ../../../..'
alias .3='cd ../../..'
alias .4='cd ../../../..'
alias .5='cd ../../../../..'
alias ~='cd ~/'

# Common Operations
alias mkcd="mkdir_cd"
alias cpd="pwd | clip"

alias sagi='sudo apt-get install'
alias sagu='sudo apt-get update'
alias saar='sudo add-apt-repository'
alias e='pantheon-files'
alias e.='pantheon-files .'
alias hs='history | grep -i $1'
alias hstpct='history_percent'
alias untar='tar -xzf'

# Apps
alias t="touch"
alias ds="dashing start"
alias djs="dashing-js start"
alias ns="npm start"
alias be="bundle exec"
alias mm="middleman"
alias serve="nserver"
alias djs="dashing-js start"
alias subla="subl . -a"
alias sublo="create_open_sublime"

# Git

git config --global user.name "Elliot DeNolf"
git config --global user.email "denolfe@gmail.com"

git config --global alias.l 'log --oneline --graph --decorate --all'
git config --global alias.l1 "log --graph --abbrev-commit --decorate --date=relative --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(bold yellow)%d%C(reset)' --all"
git config --global alias.l2 "log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold cyan)%aD%C(reset) %C(bold green)(%ar)%C(reset)%C(bold yellow)%d%C(reset)%n''          %C(white)%s%C(reset) %C(dim white)- %an%C(reset)' --all"
git config --global alias.l3 "log --format='%C(bold cyan)%h%Creset %s %Cgreen(%cr) %C(blue)<%an>%Creset%C(yellow)%d%Creset'"

git config --global alias.last 'log -1 HEAD'
git config --global alias.unstage 'reset HEAD --'
git config --global alias.hist 'log --oneline --graph --decorate --all'
git config --global alias.stu 'status -uno'
git config --global alias.st 'status'
git config --global alias.unp 'log origin/master..HEAD'
git config --global alias.pom 'push origin master'
git config --global alias.undolast 'reset HEAD~1'

alias gl="git l1"
alias glast="git log -1 HEAD"
alias guns="git reset HEAD --"
alias gstu="git status -uno"
alias gst="git status"
alias gpo="git push origin"
alias gpom="git push origin master"
alias gundo="git reset HEAD~1"
alias gc="git clone"

history_percent() {
	history | awk '{CMD[$2]++;count++;}END { for (a in CMD)print CMD[a] " " CMD[a]/count*100 "% " a;}' | grep -v "./" | column -c3 -s " " -t | sort -nr | nl | head -n10
}

create_open_sublime() {
	if [ -z "$1" ]
	then
		echo "Missing file parameter"
	else
		touch "$1"
		subl "$1"
		echo "$1 created"
	fi
}

mkdir_cd() {
	if [ -z "$1" ]
	then
		echo "Missing folder parameter"
	else
		mkdir "$1"
		cd "$1"
	fi
}

diag () {
	echo $(git config user.name)
	echo $(git config user.email)
	echo ""	
	echo $(git --version)
	echo node:  $(node -v)
	echo npm:   v$(npm -v)
	echo bower: v$(bower -v)
	echo $(ruby -v)
}

if [ -e $CMDER_ROOT/config/.bash_priv ]; then
	. $CMDER_ROOT/config/.bash_priv
fi

find_git_dirty () {
  if [[ ! -z $(__git_ps1) && -n $(git status --porcelain) ]]; then echo "*"; fi
}

# PS1
ORANGE="\[\033[32m\]"
RED="\[\033[31m\]"
GREEN="\[\033[33m\]"
BLUE="\[\033[36m\]"
WHITE="\[\033[0m\]"
export PS1="${ORANGE}\u ${GREEN}\w${BLUE}\n$ "