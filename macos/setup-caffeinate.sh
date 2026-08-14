#!/usr/bin/env bash
# Install a launchd agent that keeps caffeinate running at login and relaunches it if it dies.
set -euo pipefail

LABEL="local.caffeinate"
FLAGS="-di" # -d prevent display sleep, -i prevent idle system sleep (keeps screen on)
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
CAFFEINATE="$(command -v caffeinate)"

[ -n "$CAFFEINATE" ] || { echo "caffeinate not found" >&2; exit 1; }

mkdir -p "$HOME/Library/LaunchAgents"

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$LABEL</string>
    <key>ProgramArguments</key>
    <array>
        <string>$CAFFEINATE</string>
        <string>$FLAGS</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# Reload: bootout ignores "not loaded" so re-runs stay clean.
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"

echo "Installed $LABEL ($CAFFEINATE $FLAGS)"
launchctl list | grep "$LABEL"
