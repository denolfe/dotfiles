#!/usr/bin/env bash
# Show current zellij layout info
# Usage: zellij-info.sh

set -euo pipefail

echo "=== Tabs ==="
zellij action query-tab-names 2>/dev/null | nl -v 1

echo ""
echo "=== Panes ==="
# Only look at panes before new_tab_template section
zellij action dump-layout 2>/dev/null | sed '/new_tab_template/,$d' | grep -E '^\s+pane' | grep -v 'borderless=true\|split_direction' | while read -r line; do
  if echo "$line" | grep -q 'command='; then
    cmd=$(echo "$line" | sed 's/.*command="\([^"]*\)".*/\1/')
    focus=""
    echo "$line" | grep -q 'focus=true' && focus=" [FOCUSED]"
    echo "  $cmd$focus"
  else
    echo "  terminal"
  fi
done

echo ""
echo "Current: ZELLIJ_PANE_ID=$ZELLIJ_PANE_ID"
