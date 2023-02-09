#!/usr/bin/env bash

# Installs latest payload using create-payload-app and runs it

latest_payload() {
  PROJECT_DIR=payload-$(npm view payload version | tr '.' '-')
  echo "Project dir: $PROJECT_DIR"
  npx --yes create-payload-app@latest -n $PROJECT_DIR -t blog --db mongodb://localhost/$PROJECTDIR --no-deps
  cd ./$PROJECT_DIR
  yarn
  yarn dev
}
