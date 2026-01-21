#!/usr/bin/env bash
# Create a new task folder with 1-TASK.md
# Usage: new-task.sh <task-name> [task-title]
#   task-name: hyphenated folder name (e.g., "simple-task")
#   task-title: optional H1 title (defaults to task-name with hyphens replaced by spaces)

set -euo pipefail

task_name="${1:?Usage: new-task.sh <task-name> [task-title]}"
task_title="${2:-$(echo "$task_name" | tr '-' ' ')}"

plans_dir="${HOME}/.claude/plans"
date_prefix=$(date +%Y-%m-%d)
task_dir="${plans_dir}/${date_prefix}-${task_name}"

mkdir -p "$task_dir"
echo "# ${task_title}" > "${task_dir}/1-TASK.md"

echo "$task_dir"
