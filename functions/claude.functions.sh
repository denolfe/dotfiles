#!/usr/bin/env bash
#
# Claude helper functions

# 1. Make git worktree
# 2. pnpm install
# 3. Link entire .claude directory from main worktree
clwt() {
  local feature_name="$1"

  # Validate argument
  if [ -z "$feature_name" ]; then
    echo "Error: Feature name required"
    echo "Usage: clwt <feature-name>"
    return 1
  fi

  # Validate we're in a git repo
  if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    echo "Error: Not in a git repository"
    return 1
  fi

  # Get the current repo name
  local repo_name
  repo_name=$(basename "$(git rev-parse --show-toplevel)")

  # Construct worktree path
  local worktree_path="../${repo_name}-wt-${feature_name}"

  # Create worktree with new branch
  echo "Creating worktree at $worktree_path with branch $feature_name..."
  git worktree add -b "$feature_name" "$worktree_path" || return 1

  # cd into the new worktree
  cd "$worktree_path" || return 1

  # Run pnpm install
  echo "Running pnpm install..."
  pnpm install || return 1

  # Link .claude directory from main worktree
  local main_worktree
  main_worktree=$(git worktree list | head -1 | awk '{print $1}')

  if [ -d "$main_worktree/.claude" ]; then
    echo "Linking .claude directory..."
    # Remove .claude if it was checked out by git
    rm -rf .claude
    ln -s "$main_worktree/.claude" .claude || return 1
    echo "Worktree setup complete!"
  else
    echo "Warning: No .claude directory found in main worktree"
    echo "Worktree setup complete (without .claude link)!"
  fi
}
