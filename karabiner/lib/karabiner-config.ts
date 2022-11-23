import * as fs from 'fs'
import { KarabinerGlobals, KarabinerProfile } from './types'

export class KarabinerConfig {
  global: KarabinerGlobals
  profiles: KarabinerProfile[]
  constructor(globals?: KarabinerGlobals) {
    this.global = globals ?? {
      check_for_updates_on_startup: true,
      show_in_menu_bar: true,
      show_profile_name_in_menu_bar: false,
    }
    this.profiles = []
  }

  addProfile(profile: KarabinerProfile) {
    this.profiles.push(profile)
  }

  writeConfig(configPath?: string) {
    if (!configPath) {
      const homeDir = process.env.HOME
      configPath = homeDir + '/.config/karabiner/karabiner.json'
    }

    fs.writeFileSync(
      configPath,
      JSON.stringify(
        {
          global: this.global,
          profiles: this.profiles,
        },
        null,
        '  ',
      ),
    )
  }
}
