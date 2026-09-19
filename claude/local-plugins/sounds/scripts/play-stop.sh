#!/usr/bin/env bash
# Play the stop sound only for a real top-level turn finish, not subagent
# completions. Claude Code reuses the Stop hook inside subagents but reports
# hook_event_name as "SubagentStop", so gate on the top-level event.
set -euo pipefail

payload="$(cat)"
event="$(printf '%s' "$payload" | /usr/bin/python3 -c 'import json,sys; print(json.load(sys.stdin).get("hook_event_name",""))' 2>/dev/null || true)"

[ "$event" = "SubagentStop" ] && exit 0

afplay /System/Library/Sounds/Funk.aiff
