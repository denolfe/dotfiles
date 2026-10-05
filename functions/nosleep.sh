#!/usr/bin/env bash

# Prevents sleeping including when closing the lid.
# Re-enables sleep when cancelled.
nosleep() {
  sudo pmset -a disablesleep 1
  caffeinate -si &
  local pid=$!
  trap 'kill $pid 2>/dev/null; sudo pmset -a disablesleep 0; trap - INT' INT
  wait $pid
  sudo pmset -a disablesleep 0
}