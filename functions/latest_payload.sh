#!/usr/bin/env bash

# Installs latest payload using create-payload-app and cd into the project directory
latest_payload() {
  PROJECT_DIR=payload-$(pnpm view payload dist-tags.latest | tr '.' '-')
  echo "Project dir: $PROJECT_DIR"
  pnpx create-payload-app@latest -n "$PROJECT_DIR" -t blank --db mongodb --db-connection-string "mongodb://127.0.0.1/$PROJECT_DIR" --yes
  cd ./"$PROJECT_DIR" || return
}
