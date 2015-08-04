# Solarized Themes
set_dark () {
	gsettings set org.pantheon.terminal.settings font 'Droid Sans Mono for Powerline 10'
	gsettings set org.pantheon.terminal.settings background '#00002B2B3636'
	gsettings set org.pantheon.terminal.settings foreground '#838394949696'
	gsettings set org.pantheon.terminal.settings cursor-color '#838394949696'
	gsettings set org.pantheon.terminal.settings palette '#070736364242:#DCDC32322F2F:#858599990000:#B5B589890000:#26268B8BD2D2:#D3D336368282:#2A2AA1A19898:#EEEEE8E8D5D5:#00002B2B3636:#CBCB4B4B1616:#858599990000:#65657B7B8383:#26268B8BD2D2:#6C6C7171C4C4:#9393A1A1A1A1:#FDFDF6F6E3E3'
	gsettings set org.pantheon.terminal.settings opacity 98	
	gsettings set org.pantheon.terminal.settings follow-last-tab true
}

set_light() {
	gsettings set org.pantheon.terminal.settings font 'Droid Sans Mono for Powerline 10'
	gsettings set org.pantheon.terminal.settings background '#fdfdf6f6e3e3'
	gsettings set org.pantheon.terminal.settings foreground '#65657b7b8383'
	gsettings set org.pantheon.terminal.settings cursor-color '#65657b7b8383'
	gsettings set org.pantheon.terminal.settings palette '#070736364242:#DCDC32322F2F:#858599990000:#B5B589890000:#26268B8BD2D2:#D3D336368282:#2A2AA1A19898:#EEEEE8E8D5D5:#00002B2B3636:#CBCB4B4B1616:#58586E6E7575:#65657B7B8383:#838394949696:#6C6C7171C4C4:#9393A1A1A1A1:#FDFDF6F6E3E3'
	gsettings set org.pantheon.terminal.settings opacity 98	
	gsettings set org.pantheon.terminal.settings follow-last-tab true
}

# mkdir then cd into
mkcd() {
	if [ -z "$1" ]
	then
		echo "Missing folder parameter"
	else
		mkdir "$1"
		cd "$1"
	fi
}

# Create file then open in Sublime
sublo() {
	if [ -z "$1" ]
	then
		echo "Missing file parameter"
	else
		touch "$1"
		subl "$1"
		echo "$1 created"
	fi
}

# credit: http://nparikh.org/notes/zshrc.txt
# Usage: extract <file>
# Description: extracts archived files / mounts disk images
# Note: .dmg/hdiutil is Mac OS X-specific.
extract () {
    if [ -f $1 ]; then
        case $1 in
            *.tar.bz2)  tar -jxvf $1                        ;;
            *.tar.gz)   tar -zxvf $1                        ;;
            *.bz2)      bunzip2 $1                          ;;
            *.dmg)      hdiutil mount $1                    ;;
            *.gz)       gunzip $1                           ;;
            *.tar)      tar -xvf $1                         ;;
            *.tbz2)     tar -jxvf $1                        ;;
            *.tgz)      tar -zxvf $1                        ;;
            *.zip)      unzip $1                            ;;
            *.ZIP)      unzip $1                            ;;
            *.pax)      cat $1 | pax -r                     ;;
            *.pax.Z)    uncompress $1 --stdout | pax -r     ;;
            *.Z)        uncompress $1                       ;;
            *)          echo "'$1' cannot be extracted/mounted via extract()" ;;
        esac
    else
        echo "'$1' is not a valid file"
    fi
}