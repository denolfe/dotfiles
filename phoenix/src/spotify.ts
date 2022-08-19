import { osascript } from './utils/osascript'

function spotifyCmd(command: 'playpause' | 'next track' | 'previous track'): string {
  return `tell application "Spotify" to ${command}`
}

export function playOrPause() {
  osascript(spotifyCmd('playpause'))
}
export function nextTrack() {
  osascript(spotifyCmd('next track'))
}
export function previousTrack() {
  osascript(spotifyCmd('previous track'))
}
