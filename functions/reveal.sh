#!/usr/bin/env bash

# Toggle ZSH_PLUGINS_ALIAS_TIPS_REVEAL for showing expanded aliases

reveal() {
  if [[ $ZSH_PLUGINS_ALIAS_TIPS_REVEAL -eq 0 || -z $ZSH_PLUGINS_ALIAS_TIPS_REVEAL ]]; then
    export ZSH_PLUGINS_ALIAS_TIPS_REVEAL=1
  else
    export ZSH_PLUGINS_ALIAS_TIPS_REVEAL=0
  fi

  echo "ZSH_PLUGINS_ALIAS_TIPS_REVEAL set to $ZSH_PLUGINS_ALIAS_TIPS_REVEAL"
}
