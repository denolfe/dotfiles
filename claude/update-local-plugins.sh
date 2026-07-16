#!/usr/bin/env bash
# Install/update the local-plugins marketplace and every plugin it declares.
# Idempotent: safe to re-run. Plugin list is derived from marketplace.json,
# so adding/removing a plugin there is all that's needed.

set -euo pipefail

LOCAL_MARKETPLACE="${HOME}/.claude/local-plugins"
MANIFEST="${LOCAL_MARKETPLACE}/.claude-plugin/marketplace.json"

if [[ ! -d "$LOCAL_MARKETPLACE" ]]; then
  echo "[LOCAL] ⚠ Local marketplace not found at $LOCAL_MARKETPLACE"
  echo "        Run: ln -s ~/.dotfiles/claude/local-plugins ~/.claude/local-plugins"
  exit 1
fi

if [[ ! -f "$MANIFEST" ]]; then
  echo "[LOCAL] ✘ Marketplace manifest not found at $MANIFEST" >&2
  exit 1
fi

echo "[LOCAL] Updating local marketplace..."
claude plugin marketplace update local 2>/dev/null || claude plugin marketplace add "$LOCAL_MARKETPLACE"

echo "[LOCAL] Installing/updating plugins from manifest..."

# Run a plugin subcommand, tolerating the "already in desired state" case while
# surfacing any genuine failure (e.g. a clone that fails auth).
run_plugin() {
  local action="$1" full="$2" out status=0
  out="$(claude plugin "$action" "$full" 2>&1)" || status=$?
  if [[ $status -eq 0 ]]; then
    return 0
  fi
  if grep -qiE 'already (installed|enabled|exists|up[- ]?to[- ]?date)' <<<"$out"; then
    echo "  ✔ ${full} already ${action}d"
    return 0
  fi
  echo "  ✘ ${full} ${action} failed:" >&2
  echo "$out" | sed 's/^/      /' >&2
  return 1
}

# Git-sourced plugins: `claude plugin update` only refetches when the manifest
# version changes, so new commits on the same pinned ref are silently skipped.
# Detect that by comparing the installed gitCommitSha against the remote tip.
INSTALLED_JSON="${HOME}/.claude/plugins/installed_plugins.json"

is_stale_git_plugin() {
  local plugin="$1" url ref installed_sha remote_sha
  url=$(jq -r --arg n "$plugin" '.plugins[] | select(.name == $n) | .source | objects | .url // empty' "$MANIFEST")
  [[ -z "$url" ]] && return 1
  [[ -f "$INSTALLED_JSON" ]] || return 1
  installed_sha=$(jq -r --arg key "${plugin}@local" \
    '.plugins[$key][0].gitCommitSha // empty' "$INSTALLED_JSON")
  [[ -z "$installed_sha" ]] && return 1
  ref=$(jq -r --arg n "$plugin" '.plugins[] | select(.name == $n) | .source | objects | .ref // "HEAD"' "$MANIFEST")
  # awk END: for annotated tags ls-remote lists tag then peeled ^{}; last line is the commit
  remote_sha=$(git ls-remote "$url" "$ref" 2>/dev/null | awk 'END { print $1 }')
  [[ -n "$remote_sha" && "$remote_sha" != "$installed_sha" ]]
}

FAILED=0
while IFS= read -r PLUGIN; do
  [[ -z "$PLUGIN" ]] && continue
  FULL_NAME="${PLUGIN}@local"
  if is_stale_git_plugin "$PLUGIN"; then
    echo "  ↻ ${FULL_NAME} pinned ref moved; reinstalling…"
    run_plugin uninstall "$FULL_NAME" || FAILED=1
  fi
  run_plugin install "$FULL_NAME" || FAILED=1
  run_plugin enable "$FULL_NAME" || FAILED=1
  run_plugin update "$FULL_NAME" || FAILED=1
done < <(jq -r '.plugins[].name' "$MANIFEST")

if [[ $FAILED -ne 0 ]]; then
  echo "[LOCAL] ✘ One or more plugins failed" >&2
  exit 1
fi
echo "[LOCAL] ✔ Done"
