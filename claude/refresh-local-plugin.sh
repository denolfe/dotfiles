#!/usr/bin/env bash
# Wipe a local plugin's install cache and re-sync from source.
# Usage: refresh-local-plugin.sh <plugin-name>

set -euo pipefail

PLUGIN="${1:-}"
if [[ -z "$PLUGIN" ]]; then
  echo "usage: $(basename "$0") <plugin-name>" >&2
  exit 2
fi

SRC="${HOME}/.dotfiles/claude/local-plugins/${PLUGIN}"
CACHE_ROOT="${HOME}/.claude/plugins/cache/local/${PLUGIN}"

if [[ ! -d "$SRC" ]]; then
  echo "✘ source not found: $SRC" >&2
  exit 1
fi

VERSION=$(jq -r '.version // "0.0.1"' "${SRC}/.claude-plugin/plugin.json")
DEST="${CACHE_ROOT}/${VERSION}"

INSTALLED_JSON="${HOME}/.claude/plugins/installed_plugins.json"
INSTALLED_VERSION=""
if [[ -f "$INSTALLED_JSON" ]]; then
  INSTALLED_VERSION=$(jq -r --arg key "${PLUGIN}@local" \
    '.plugins[$key][0].version // empty' "$INSTALLED_JSON")
fi

rm -rf "$CACHE_ROOT"
mkdir -p "$DEST"
cp -R "${SRC}/." "${DEST}/"

if ! diff -rq "$DEST" "$SRC" >/dev/null; then
  echo "✘ cache differs from source after copy" >&2
  exit 1
fi
echo "✔ ${PLUGIN}@${VERSION} cache refreshed (${DEST})"

if [[ -n "$INSTALLED_VERSION" && "$INSTALLED_VERSION" != "$VERSION" ]]; then
  echo "↻ installed version (${INSTALLED_VERSION}) differs from source (${VERSION}); reinstalling…"
  claude plugin install "${PLUGIN}@local"
fi
