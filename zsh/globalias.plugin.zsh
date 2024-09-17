# Modified version of the globalias plugin from oh-my-zsh
# Link: https://github.com/ohmyzsh/ohmyzsh/blob/master/plugins/globalias/globalias.plugin.zsh

# Modifications:
# - Added a check for the environment variable ENABLE_GLOBALIAS to enable/disable global alias expansion
# - Swapped the space and control-space bindings
# - Handle command substitution by performing a non-executing substitution

globalias() {
   # Check if the environment variable is set to enable global alias expansion
   if [[ "${ENABLE_GLOBALIAS}" == "1" ]]; then
      # Get last word to the left of the cursor
      local word=${${(Az)LBUFFER}[-1]}
      if [[ $GLOBALIAS_FILTER_VALUES[(Ie)$word] -eq 0 ]]; then
         zle _expand_alias

         # Perform a non-executing substitution for command substitution
         LBUFFER=$(print -r -- "$LBUFFER")

         # Prevent the extra space or any additional output
         zle -I
         zle redisplay
         return 0
      fi
   fi
   # Insert space if no expansion occurs
   zle self-insert
}

zle -N globalias

# Bindings for alias expansion on space
bindkey -M emacs " " globalias
bindkey -M viins " " globalias

# Control-space for normal space
bindkey -M emacs "^ " magic-space
bindkey -M viins "^ " magic-space

# Normal space during searches
bindkey -M isearch " " magic-space
