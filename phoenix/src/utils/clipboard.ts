import { osascript } from './osascript'

/** Append selection to clipboard */
export function appendToClipboard() {
  osascript(`
use scripting additions
use framework "Foundation"

set prevClipboard to the clipboard
set thePasteboard to current application's NSPasteboard's generalPasteboard()
set theCount to thePasteboard's changeCount()
-- Copy selected text to clipboard:
tell application "System Events" to keystroke "c" using {command down}
-- Check for changed clipboard:
repeat 20 times
	if thePasteboard's changeCount() is not theCount then exit repeat
	delay 0.1
end repeat

set newClipboard to prevClipboard & "
" & (the clipboard as text)

set the clipboard to newClipboard
`)
}
