#!/bin/bash

# Claude Code StatusLine - mirrors Powerlevel10k prompt
# Based on ~/.dotfiles/zsh/p10k.customizations.zsh

input=$(cat)
cwd=$(echo "$input" | jq -r '.workspace.current_dir')
project_dir=$(echo "$input" | jq -r '.workspace.project_dir')

# Change to cwd for git commands
cd "$cwd" 2>/dev/null || cd ~

# Initialize segments
segments=()

# Directory (relative to project if in project)
if [[ "$cwd" == "$project_dir"* ]] && [[ -n "$project_dir" ]]; then
  rel_path="${cwd#$project_dir}"
  rel_path="${rel_path#/}"
  if [[ -z "$rel_path" ]]; then
    dir_display="$(basename "$project_dir")"
  else
    dir_display="$(basename "$project_dir")/$rel_path"
  fi
else
  dir_display="${cwd/#$HOME/~}"
fi
segments+=("$(printf '\033[34m%s\033[0m' "$dir_display")")

# Git status & branch
if git rev-parse --is-inside-work-tree &>/dev/null; then
  branch=$(git branch --show-current 2>/dev/null)

  # PR number (orange for open, purple for merged)
  pr_info=$(git config --get branch."$branch".github-pr-owner-number 2>/dev/null)
  if [[ -n "$pr_info" ]]; then
    pr_number=$(echo "$pr_info" | awk -F "#" '{print $3}')
    repo=$(echo "$pr_info" | awk -F "#" '{print $1 "/" $2}')

    if [[ -n "$pr_number" ]]; then
      # Check cache
      cache=$(git config --get branch."$branch".github-pr-state-cache 2>/dev/null)
      pr_color='\033[38;5;208m'  # Orange default

      if [[ -n "$cache" ]]; then
        cached_state=$(echo "$cache" | cut -d: -f1)
        if [[ "$cached_state" == "MERGED" ]]; then
          pr_color='\033[38;5;135m'  # Purple
        fi
      fi

      segments+=("$(printf '%b#%s\033[0m' "$pr_color" "$pr_number")")
    fi
  fi

  # Branch & status indicators
  if [[ -n "$branch" ]]; then
    status=$(git --no-optional-locks status --porcelain 2>/dev/null)

    # Count status indicators
    staged=0
    modified=0
    untracked=0
    deleted=0

    while IFS= read -r line; do
      [[ -z "$line" ]] && continue
      x="${line:0:1}"
      y="${line:1:1}"

      # Staged changes (index)
      [[ "$x" =~ [MADRC] ]] && ((staged++))

      # Unstaged modifications
      [[ "$y" == "M" ]] && ((modified++))

      # Deleted files
      [[ "$y" == "D" ]] && ((deleted++))

      # Untracked files
      [[ "$x" == "?" ]] && ((untracked++))
    done <<< "$status"

    # Build branch segment with icon (U+E0A0 = \356\202\240)
    if [[ -n "$status" ]]; then
      # Modified (cyan)
      branch_seg="$(printf '\033[36m\356\202\240 %s\033[0m' "$branch")"
    else
      # Clean (green)
      branch_seg="$(printf '\033[32m\356\202\240 %s\033[0m' "$branch")"
    fi

    # Add status indicators
    indicators=""

    # Commits ahead/behind upstream (first)
    upstream=$(git rev-parse --abbrev-ref "@{upstream}" 2>/dev/null)
    if [[ -n "$upstream" ]]; then
      ahead=$(git rev-list --count "@{upstream}..HEAD" 2>/dev/null)
      behind=$(git rev-list --count "HEAD..@{upstream}" 2>/dev/null)
      [[ $behind -gt 0 ]] && indicators+="$(printf '\033[36m↓%d\033[0m ' "$behind")"
      [[ $ahead -gt 0 ]] && indicators+="$(printf '\033[36m↑%d\033[0m ' "$ahead")"
    fi

    # File status indicators
    [[ $staged -gt 0 ]] && indicators+="$(printf '\033[32m+%d\033[0m ' "$staged")"
    [[ $modified -gt 0 ]] && indicators+="$(printf '\033[33m!%d\033[0m ' "$modified")"
    [[ $deleted -gt 0 ]] && indicators+="$(printf '\033[31m-%d\033[0m ' "$deleted")"
    [[ $untracked -gt 0 ]] && indicators+="$(printf '\033[31m?%d\033[0m ' "$untracked")"

    # Trim trailing space
    indicators="${indicators% }"

    # Combine branch and indicators
    if [[ -n "$indicators" ]]; then
      segments+=("$(printf '%b %s' "$branch_seg" "$indicators")")
    else
      segments+=("$branch_seg")
    fi
  fi
fi

# Model name
model_name=$(echo "$input" | jq -r '.model.display_name')
if [[ -n "$model_name" ]] && [[ "$model_name" != "null" ]]; then
  segments+=("$(printf '\033[35m%s\033[0m' "$model_name")")
fi

# Context window with gradient bar
usage=$(echo "$input" | jq '.context_window.current_usage')
if [[ "$usage" != "null" ]]; then
  current=$(echo "$usage" | jq '.input_tokens + .cache_creation_input_tokens + .cache_read_input_tokens')
  size=$(echo "$input" | jq '.context_window.context_window_size')
  if [[ "$size" -gt 0 ]]; then
    pct=$((current * 100 / size))

    # Color gradient matching p10k theme
    if [[ $pct -lt 25 ]]; then
      bar_color=$'\033[38;5;2m'    # Green (OK/clean)
    elif [[ $pct -lt 50 ]]; then
      bar_color=$'\033[38;5;6m'    # Cyan (modified)
    elif [[ $pct -lt 65 ]]; then
      bar_color=$'\033[38;5;3m'    # Yellow (AWS)
    elif [[ $pct -lt 80 ]]; then
      bar_color=$'\033[38;5;208m'  # Orange (PR/warning)
    else
      bar_color=$'\033[38;5;1m'    # Red (error)
    fi

    # Build 10-char bar with 40-step precision (4 gradient levels per char)
    # █ (full) → ▓ (75%) → ▒ (50%) → ░ (25%) → space (empty)
    steps=$((pct * 40 / 100))
    [[ $steps -gt 40 ]] && steps=40

    full=$((steps / 4))
    partial=$((steps % 4))
    empty=$((10 - full - (partial > 0 ? 1 : 0)))

    bar=""
    for ((i=0; i<full; i++)); do bar+="█"; done
    case $partial in
      1) bar+="░" ;;
      2) bar+="▒" ;;
      3) bar+="▓" ;;
    esac

    # Colors (using $'...' for proper escape interpretation)
    dim=$'\033[38;5;238m'
    reset=$'\033[0m'

    # Rounded caps (powerline round separators)
    left_cap=$'\xEE\x82\xB6'   # U+E0B6 round left
    right_cap=$'\xEE\x82\xB4'  # U+E0B4 round right

    # Build track (empty portion)
    track=""
    for ((i=0; i<empty; i++)); do track+="░"; done

    # Left cap: bar color if any fill, otherwise dim
    if [[ $full -gt 0 || $partial -gt 0 ]]; then
      left="${bar_color}${left_cap}"
    else
      left="${dim}${left_cap}"
    fi

    # Darker dim for powerline cap (glyph renders brighter than ░)
    dim_cap=$'\033[38;2;40;40;40m'

    # Build complete bar: left + fill + track + right
    if [[ $empty -eq 0 && $partial -eq 0 ]]; then
      # Full bar: right cap matches fill
      output="${left}${bar_color}${bar}${right_cap}${reset}"
    else
      # Partial bar: track dim, cap darker to match visually
      output="${left}${bar_color}${bar}${dim}${track}${dim_cap}${right_cap}${reset}"
    fi

    segments+=("${output} ${bar_color}${pct}%${reset}")
  fi
fi

# Session cost & duration
cost=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
duration_ms=$(echo "$input" | jq -r '.cost.total_duration_ms // 0')
if [[ "$cost" != "0" ]] && [[ "$cost" != "null" ]]; then
  cost_str=$(printf '$%.2f' "$cost")
  if [[ "$duration_ms" != "0" ]] && [[ "$duration_ms" != "null" ]]; then
    duration_sec=$((duration_ms / 1000))
    if [[ $duration_sec -ge 60 ]]; then
      mins=$((duration_sec / 60))
      secs=$((duration_sec % 60))
      duration_str="${mins}m${secs}s"
    else
      duration_str="${duration_sec}s"
    fi
    segments+=("$(printf '\033[90m%s %s\033[0m' "$cost_str" "$duration_str")")
  else
    segments+=("$(printf '\033[90m%s\033[0m' "$cost_str")")
  fi
fi

# Join with separator
sep=" \033[2m│\033[0m "
output=""
for i in "${!segments[@]}"; do
  [[ $i -gt 0 ]] && output+="$sep"
  output+="${segments[$i]}"
done
printf "%b\n" "$output"
