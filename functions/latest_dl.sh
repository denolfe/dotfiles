#!/usr/bin/env bash

latest_dl() {
  find ~/Downloads -print0 |
    xargs -r -0 ls -1 -t |
    head -1
}
