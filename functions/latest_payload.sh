#!/usr/bin/env bash

# Installs latest payload using create-payload-app and cd into the project directory
latest_payload() {
  PROJECT_DIR=payload-$(pnpm view payload dist-tags --json | jq -r '.beta' | tr '.' '-')
  echo "Project dir: $PROJECT_DIR"
  pnpx create-payload-app@beta -n "$PROJECT_DIR" -t blank --db mongodb --db-connection-string "mongodb://127.0.0.1/$PROJECT_DIR" --yes
  cd ./"$PROJECT_DIR" || return
}
