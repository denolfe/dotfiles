#!/bin/bash

# Demo script: renders Claude context bar through all states (0-100%)
# Animation showing the 40-step gradient with heatmap coloring

# Heatmap color by position (0-9)
heatmap_color() {
  local pos=$1
  local r g b
  if [[ $pos -lt 5 ]]; then
    r=$((pos * 220 / 5))
    g=180
    b=0
  else
    r=220
    g=$((180 - (pos - 5) * 120 / 5))
    b=0
  fi
  printf '\033[38;2;%d;%d;%dm' "$r" "$g" "$b"
}

# Dimmed heatmap for partial fills
heatmap_color_partial() {
  local pos=$1 brightness=$2
  local r g b
  if [[ $pos -lt 5 ]]; then
    r=$((pos * 220 / 5 * brightness / 100))
    g=$((180 * brightness / 100))
    b=0
  else
    r=$((220 * brightness / 100))
    g=$(((180 - (pos - 5) * 120 / 5) * brightness / 100))
    b=0
  fi
  printf '\033[38;2;%d;%d;%dm' "$r" "$g" "$b"
}

render_bar() {
  local pct=$1

  # Powerline rounded caps
  local left_cap=$'\xEE\x82\xB6'   # U+E0B6
  local right_cap=$'\xEE\x82\xB4'  # U+E0B4
  local dim=$'\033[38;5;238m'
  local dim_cap=$'\033[38;2;40;40;40m'
  local reset=$'\033[0m'

  # 40 steps for 10-char bar (4 per char)
  local steps=$((pct * 40 / 100))
  [[ $steps -gt 40 ]] && steps=40

  local full=$((steps / 4))
  local partial=$((steps % 4))
  local empty=$((10 - full - (partial > 0 ? 1 : 0)))

  # Build filled portion with heatmap
  local bar=""
  local pos=0
  for ((i=0; i<full; i++)); do
    bar+="$(heatmap_color $pos)█"
    ((pos++))
  done

  # Partial fill
  if [[ $partial -gt 0 ]]; then
    local dim_pos=$((pos > 0 ? pos - 1 : 0))
    case $partial in
      1) bar+="$(heatmap_color_partial $dim_pos 35)░" ;;
      2) bar+="$(heatmap_color_partial $dim_pos 55)▒" ;;
      3) bar+="$(heatmap_color_partial $dim_pos 80)▓" ;;
    esac
  fi

  # Empty track
  local track=""
  for ((i=0; i<empty; i++)); do track+="░"; done

  # Left cap
  local left
  if [[ $full -gt 0 || $partial -gt 0 ]]; then
    left="$(heatmap_color 0)${left_cap}"
  else
    left="${dim}${left_cap}"
  fi

  # Right cap and assembly
  local output
  if [[ $empty -eq 0 && $partial -eq 0 ]]; then
    output="${left}${bar}$(heatmap_color 9)${right_cap}${reset}"
  else
    output="${left}${bar}${dim}${track}${dim_cap}${right_cap}${reset}"
  fi

  # Percentage color
  local last_pos=$((full + (partial > 0 ? 1 : 0) - 1))
  [[ $last_pos -lt 0 ]] && last_pos=0
  local pct_color=$(heatmap_color $last_pos)

  printf "%b %b%3d%%%b" "$output" "$pct_color" "$pct" "$reset"
}

# Parse args
delay=0.05
mode="animate"
while [[ $# -gt 0 ]]; do
  case $1 in
    --slow) delay=0.15; shift ;;
    --fast) delay=0.02; shift ;;
    --all) mode="all"; shift ;;
    --loop) mode="loop"; shift ;;
    *) shift ;;
  esac
done

# Hide cursor during animation
trap 'printf "\033[?25h"' EXIT
printf "\033[?25l"

case $mode in
  all)
    # Show all states at once (every 10%)
    printf "\n  Context Bar States\n\n"
    for pct in 0 5 10 20 30 40 50 60 70 80 90 100; do
      printf "  "
      render_bar $pct
      printf "\n"
    done
    printf "\n"
    ;;

  loop)
    # Loop forever
    while true; do
      for pct in $(seq 0 100); do
        printf "\r  "
        render_bar $pct
        sleep "$delay"
      done
      for pct in $(seq 100 -1 0); do
        printf "\r  "
        render_bar $pct
        sleep "$delay"
      done
    done
    ;;

  animate|*)
    # Single animation 0→100
    printf "\n"
    for pct in $(seq 0 100); do
      printf "\r  "
      render_bar $pct
      sleep "$delay"
    done
    printf "\n\n"
    ;;
esac
