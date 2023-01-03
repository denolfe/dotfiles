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

export function setClipboard(text: string) {
  Task.run('/bin/bash', ['-c', `echo -n "${text}" | pbcopy`], task => {
    console.log('task.status', task.status)
  })
}

export function getClipboard(): Promise<string> {
  return new Promise((resolve, reject) => {
    Task.run('/usr/bin/pbpaste', [], task => {
      return resolve(task.output)
    })
  })
}
