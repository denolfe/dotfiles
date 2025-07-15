#!/usr/bin/env bash

__tre() {
  local level="${1:-2}"
  local dir="${2:-.}"
  local output=$(rg --files "$dir" | tree --fromfile -L "$level" -C)
  echo "${output}"
}

tr2() {
  __tre 2 "$1"
}

tr3() {
  __tre 3 "$1"
}
tr4() {
  __tre 4 "$1"
}
tr5() {
  __tre 5 "$1"
}
trall() {
  __tre 1000 "$1"
}
