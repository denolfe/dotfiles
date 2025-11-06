# Powerelevel10k customizations

# This file should be sourced loading p10k.zsh with the following options:
# nerdfont-v3 + powerline, small icons, rainbow, unicode,
# round separators, blurred heads, round tails, 2 lines, disconnected, no frame,
# compact, many icons, concise, instant_prompt=verbose.

typeset -g POWERLEVEL9K_LEFT_PROMPT_ELEMENTS=(
  dir
  pr_number
  vcs
  newline
  prompt_char
)

POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=(
  command_execution_time  # duration of the last command
  background_jobs         # presence of background jobs
  asdf                    # asdf version manager (https://github.com/asdf-vm/asdf)
  mise                    # custom segment for mise
  kubecontext             # current kubernetes context (https://kubernetes.io/)
  aws                     # aws profile (https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html)
  alias_reveal            # custom segment, show eyes emoji when aliases log out their expansions
  time                    # current time
  newline
)

POWERLEVEL9K_MODE=nerdfont-v3 # Updated from nerdfont-complete, no discernable difference
POWERLEVEL9K_ICON_PADDING=moderate

# Remove space from right prompt - https://github.com/romkatv/powerlevel10k/issues/68
typeset -g ZLE_RPROMPT_INDENT=0

# Separator between same-color segments on the left.
POWERLEVEL9K_LEFT_SUBSEGMENT_SEPARATOR='\uE0B5' # Round
# Separator between same-color segments on the right.
POWERLEVEL9K_RIGHT_SUBSEGMENT_SEPARATOR='\uE0B7' # Round
# Separator between different-color segments on the left.
POWERLEVEL9K_LEFT_SEGMENT_SEPARATOR='\uE0B4' # Round
# Separator between different-color segments on the right.
POWERLEVEL9K_RIGHT_SEGMENT_SEPARATOR='\uE0B6' # Round

# The right end of left prompt.
POWERLEVEL9K_LEFT_PROMPT_LAST_SEGMENT_END_SYMBOL='▓▒░'
# The left end of right prompt.
POWERLEVEL9K_RIGHT_PROMPT_FIRST_SEGMENT_START_SYMBOL='░▒▓'
# The left end of left prompt.
POWERLEVEL9K_LEFT_PROMPT_FIRST_SEGMENT_START_SYMBOL='\uE0B6' # Round
# The right end of right prompt.
POWERLEVEL9K_RIGHT_PROMPT_LAST_SEGMENT_END_SYMBOL='\uE0B4' # Round

typeset -g POWERLEVEL9K_PROMPT_CHAR_OK_{VIINS,VICMD,VIVIS,VIOWR}_FOREGROUND=2
typeset -g POWERLEVEL9K_PROMPT_CHAR_ERROR_{VIINS,VICMD,VIVIS,VIOWR}_FOREGROUND=001

POWERLEVEL9K_DIR_FOREGROUND=0
POWERLEVEL9K_DIR_ANCHOR_FOREGROUND=0
POWERLEVEL9K_DIR_ANCHOR_BOLD=false

# Version control system colors.
POWERLEVEL9K_VCS_MODIFIED_BACKGROUND=6
POWERLEVEL9K_VCS_GIT_GITHUB_ICON=''
POWERLEVEL9K_VCS_GIT_ICON=''
POWERLEVEL9K_VCS_BRANCH_ICON=' '

POWERLEVEL9K_DIR_CLASSES=() # No directory icon

POWERLEVEL9K_ASDF_NODEJS_PROMPT_ALWAYS_SHOW=true
POWERLEVEL9K_ASDF_NODEJS_SHOW_ON_UPGLOB='*.ts|*.js|package.json'

POWERLEVEL9K_ASDF_PNPM_BACKGROUND=214
POWERLEVEL9K_ASDF_PNPM_VISUAL_IDENTIFIER_EXPANSION=$'\ue865'

POWERLEVEL9K_KUBECONTEXT_DEFAULT_BACKGROUND=27

POWERLEVEL9K_AWS_DEFAULT_FOREGROUND=16
POWERLEVEL9K_AWS_DEFAULT_BACKGROUND=3

POWERLEVEL9K_TIME_BACKGROUND=4
POWERLEVEL9K_TIME_FORMAT='%D{%I:%M}'
POWERLEVEL9K_TIME_VISUAL_IDENTIFIER_EXPANSION=''

####################################################################################################
##################################### Custom Prompt Segments #######################################
####################################################################################################

## Custom Segment: alias_reveal - show 👀 when alias reveal is enabled

typeset -g POWERLEVEL9K_ALIAS_REVEAL_FOREGROUND=0
typeset -g POWERLEVEL9K_ALIAS_REVEAL_BACKGROUND=0

# Shows 👀 in the prompt when the ZSH_PLUGINS_ALIAS_TIPS_REVEAL is set to 1
prompt_alias_reveal() {

  if [ -z "$ZSH_PLUGINS_ALIAS_TIPS_REVEAL" ] || [ "$ZSH_PLUGINS_ALIAS_TIPS_REVEAL" -ne 1 ]; then return; fi

  _p9k_prompt_segment "$0$state" 208 016 '' 0 '' "👀"
}

## Custom Segment: pr_number - show PR number if on a branch with a PR associated

# Removed static color definitions - colors are now set dynamically in prompt_pr_number()
# typeset -g POWERLEVEL9K_PR_NUMBER_FOREGROUND=0
# typeset -g POWERLEVEL9K_PR_NUMBER_BACKGROUND=208

# Shows the PR number as hyperlink
# Color: orange (208) for open PRs, purple (135) for merged PRs
prompt_pr_number() {
  if ! git rev-parse --is-inside-work-tree &>/dev/null; then return; fi

  local pr_info=$(git config --get branch."$(git branch --show-current)".github-pr-owner-number)

  if [ -z "$pr_info" ]; then return; fi

  local pr_number=$(echo "$pr_info" | awk -F "#" '{print $3}')
  local repo=$(echo "$pr_info" | awk -F "#" '{print $1 "/" $2}')

  if [ -z "$pr_number" ]; then return; fi

  # TTL cache configuration
  local ttl=600  # 10 minutes - adjust if needed for your workflow
  local current_time=$(date +%s)
  local bg_color=208  # Default to orange (open PR color)

  # Check cache: format is "STATE:TIMESTAMP"
  local cache=$(git config --get branch."$(git branch --show-current)".github-pr-state-cache)

  if [[ -n "$cache" ]]; then
    local cached_state=$(echo "$cache" | cut -d: -f1)
    local cached_timestamp=$(echo "$cache" | cut -d: -f2)

    # MERGED PRs never expire - use cached value forever
    if [[ "$cached_state" == "MERGED" ]]; then
      bg_color=135  # Purple
      _p9k_prompt_segment "$0$state" "$bg_color" 016 '' 0 '' "#$pr_number"
      return
    fi

    # Check if OPEN cache is still valid (within TTL)
    if [[ "$cached_state" == "OPEN" ]]; then
      local age=$((current_time - cached_timestamp))
      if (( age < ttl )); then
        bg_color=208  # Orange (from cache)
        _p9k_prompt_segment "$0$state" "$bg_color" 016 '' 0 '' "#$pr_number"
        return
      fi
      # Cache expired, fall through to re-check
    fi
  fi

  # Cache miss or expired - query API and update cache
  if (( $+commands[gh] )); then
    local pr_state=$(gh pr view "$pr_number" -R "$repo" --json state -q .state 2>&1)
    if [[ "$pr_state" == "MERGED" ]]; then
      bg_color=135  # Purple
      git config branch."$(git branch --show-current)".github-pr-state-cache "MERGED:$current_time"
    else
      # OPEN, CLOSED, DRAFT, or error - all treated as OPEN with TTL
      bg_color=208  # Orange
      git config branch."$(git branch --show-current)".github-pr-state-cache "OPEN:$current_time"
    fi
  fi

  # Disable this for now, it wipes out the right prompt because of hidden char length
  # source: https://gist.github.com/egmontkob/eb114294efbcd5adb1944c9f3cb5feda
  # local pr_link=$(echo "\e]8;;https://github.com/payloadcms/payload/pull/$pr_number\e\\#$pr_number\e]8;;\e\\")
  # _p9k_prompt_segment "$0$state" "$bg_color" 016 '' 0 '' "$pr_link"

  _p9k_prompt_segment "$0$state" "$bg_color" 016 '' 0 '' "#$pr_number"
}

## Custom Segment: mise - show current versions of tools managed by mise

typeset -g POWERLEVEL9K_MISE_BACKGROUND=1

# Colors
typeset -g POWERLEVEL9K_MISE_DOTNET_CORE_BACKGROUND=93
typeset -g POWERLEVEL9K_MISE_ELIXIR_BACKGROUND=129
typeset -g POWERLEVEL9K_MISE_ERLANG_BACKGROUND=160
typeset -g POWERLEVEL9K_MISE_FLUTTER_BACKGROUND=33
typeset -g POWERLEVEL9K_MISE_GO_BACKGROUND=81
typeset -g POWERLEVEL9K_MISE_HASKELL_BACKGROUND=99
typeset -g POWERLEVEL9K_MISE_JAVA_BACKGROUND=196
typeset -g POWERLEVEL9K_MISE_JULIA_BACKGROUND=34
typeset -g POWERLEVEL9K_MISE_LUA_BACKGROUND=33
typeset -g POWERLEVEL9K_MISE_NODE_FOREGROUND=0
typeset -g POWERLEVEL9K_MISE_NODE_BACKGROUND=2
typeset -g POWERLEVEL9K_MISE_PNPM_FOREGROUND=0
typeset -g POWERLEVEL9K_MISE_PNPM_BACKGROUND=214
typeset -g POWERLEVEL9K_MISE_PERL_BACKGROUND=33
typeset -g POWERLEVEL9K_MISE_PHP_BACKGROUND=93
typeset -g POWERLEVEL9K_MISE_POSTGRES_BACKGROUND=33
typeset -g POWERLEVEL9K_MISE_PYTHON_BACKGROUND=33
typeset -g POWERLEVEL9K_MISE_RUBY_BACKGROUND=196
typeset -g POWERLEVEL9K_MISE_RUST_BACKGROUND=208

typeset -g POWERLEVEL9K_MISE_PNPM_VISUAL_IDENTIFIER_EXPANSION=$'\ue865' # pnpm icon

# Modified from: https://github.com/2KAbhishek/dots2k/blob/main/config/zsh/prompt/p10k.mise.zsh
# [Feature request: add segment for mise](https://github.com/romkatv/powerlevel10k/issues/2212)
prompt_mise() {
  if (( ! $+commands[mise] )); then
    return
  fi

  local plugins=("${(@f)$(mise ls --current --offline 2>/dev/null | awk '!/\(symlink\)/ && $3!="~/.tool-versions" && $3!="~/.config/mise/config.toml" {print $1, $2}')}")
  local plugin

  # Only load if tool is in whitelist
  local tool_whitelist=(
    NODE
    PNPM
  )

  for plugin in ${(k)plugins}; do
    local parts=("${(@s/ /)plugin}")
    local tool=${(U)parts[1]}

    if [[ "${tool_whitelist[@]}" =~ "${tool}" ]]; then
      local version=${parts[2]}
      p10k segment -r -i "${tool}_ICON" -s $tool -t "$version"
    fi

  done
}

## Custom Segment: work_aws - show AWS profile and time remaining on token

typeset -g POWERLEVEL9K_WORK_AWS_FOREGROUND=0
typeset -g POWERLEVEL9K_WORK_AWS_BACKGROUND=3

# Show remaining time on AWS token, based upon credentials file modified date
prompt_work_aws() {
  if [[ ! -f ~/.aws/credentials ]]; then return; fi

  local expiration_mins=50
  local seconds_old=$(( ($(date +%s) - $(stat -f%c ~/.aws/credentials)) ))
  local seconds_left=$(( ($expiration_mins*60) - $seconds_old ))
  local aws_details
  if (( $seconds_left < 0)); then
    aws_details=exp
  else
    # ((h=${seconds_left}/3600))
    ((m=(${seconds_left}%3600)/60))
    # aws_details=${h//\%/%%}h${m//\%/%%}m
    aws_details=${m//\%/%%}m
  fi

  _p9k_prompt_segment "$0$state" 208 016 'AWS_ICON' 0 '' "${aws_details//\%/%%}"
}

## Custom Segment: claude_usage - show Claude Code usage for today

typeset -g POWERLEVEL9K_CLAUDE_USAGE_FOREGROUND=0
typeset -g POWERLEVEL9K_CLAUDE_USAGE_BACKGROUND=208

# Show today's Claude Code cost
prompt_claude_usage() {
  if (( ! $+commands[bunx] )); then
    return
  fi

  local today=$(date +%Y-%m-%d)
  local usage_json=$(bunx ccusage --json 2>/dev/null)

  if [[ -z "$usage_json" ]]; then
    return
  fi

  local today_cost=$(echo "$usage_json" | jq -r --arg today "$today" '.daily[] | select(.date == $today) | .totalCost')

  if [[ -z "$today_cost" ]] || [[ "$today_cost" == "null" ]]; then
    return
  fi

  # Format cost with 2 decimal places
  local formatted_cost=$(printf "%.2f" "$today_cost")

  _p9k_prompt_segment "$0$state" 208 016 '' 0 '' "\$$formatted_cost 🤖"
}
