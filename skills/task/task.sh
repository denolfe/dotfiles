#!/usr/bin/env bash
# Create a new task folder with 1-TASK.md
# Usage: task.sh <task-dir> [task-title]
#   task-dir: full path to the task directory
#   task-title: optional H1 title (defaults to folder name with hyphens replaced by spaces)

set -euo pipefail

task_dir="${1:?Usage: task.sh <task-dir> [task-title]}"
folder_name=$(basename "$task_dir")
task_title="${2:-$(echo "$folder_name" | tr '-' ' ')}"

mkdir -p "$task_dir"
echo "# ${task_title}" > "${task_dir}/1-TASK.md"

echo "$task_dir"
