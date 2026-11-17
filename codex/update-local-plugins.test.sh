#!/usr/bin/env bash
# Integration test against the installed Codex CLI, using only temporary state.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/codex-bootstrap.XXXXXX")
trap 'rm -rf "$TEST_ROOT"' EXIT
export CODEX_HOME="${TEST_ROOT}/codex-home"
mkdir -p "$CODEX_HOME" "${TEST_ROOT}/checkout with spaces"
cp "$SCRIPT_DIR/update-local-plugins.sh" "${TEST_ROOT}/checkout with spaces/"
cp -R "$SCRIPT_DIR/local-plugins" "${TEST_ROOT}/checkout with spaces/"
BOOTSTRAP="${TEST_ROOT}/checkout with spaces/update-local-plugins.sh"
SOURCE="${TEST_ROOT}/checkout with spaces/local-plugins/git-guardrails"

# Existing preferences survive installation.
printf 'model = "test-preserve-me"\n' >"${CODEX_HOME}/config.toml"
bash "$BOOTSTRAP"
VERSION=$(jq -r '.version' "$SOURCE/plugin.json")
CACHE="${CODEX_HOME}/plugins/cache/dotfiles-local/git-guardrails/${VERSION}"
diff -rq "$SOURCE" "$CACHE"

# Same-version edits must reach the cache when bootstrap is run again.
printf '\n# Refresh test\n' >>"${SOURCE}/scripts/git-guardrails.sh"
bash "$BOOTSTRAP"
diff -rq "$SOURCE" "$CACHE"
[[ $(rg -c '^\[marketplaces.dotfiles-local\]$' "${CODEX_HOME}/config.toml") == 1 ]]
rg -q '^model = "test-preserve-me"$' "${CODEX_HOME}/config.toml"
rg -q '^\[plugins\."git-guardrails@dotfiles-local"\]$' "${CODEX_HOME}/config.toml"
rg -q '^enabled = true$' "${CODEX_HOME}/config.toml"

# A malformed manifest must fail before invoking Codex or changing settings.
cp "${CODEX_HOME}/config.toml" "${TEST_ROOT}/config-before.toml"
printf '{ invalid json\n' >"${TEST_ROOT}/checkout with spaces/local-plugins/.agents/plugins/marketplace.json"
if bash "$BOOTSTRAP" >"${TEST_ROOT}/invalid-output" 2>&1; then
  echo 'FAIL: invalid manifest succeeded' >&2
  exit 1
fi
cmp "${CODEX_HOME}/config.toml" "${TEST_ROOT}/config-before.toml"
echo 'Bootstrap integration checks passed'
