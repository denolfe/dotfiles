export type AppName = 'chrome' | 'vscode' | 'ghostty' | 'slack' | 'spotify' | 'notion'

export const appMap: Record<AppName, { bundle: string; name: string }> = {
  chrome: { bundle: 'com.google.Chrome', name: 'Google Chrome' },
  vscode: { bundle: 'com.microsoft.VSCode', name: 'Visual Studio Code' },
  slack: { bundle: 'com.tinyspeck.slackmacgap', name: 'Slack' },
  spotify: { bundle: 'com.spotify.client', name: 'Spotify' },
  notion: { bundle: 'notion.id', name: 'Notion' },
  ghostty: { bundle: 'com.mitchellh.ghostty', name: 'Ghostty' },
}
