import { Rule, KarabinerConfig, ComplexModificationParameters, KarabinerProfile } from './types.ts'

export class KarabinerComplexModifications {
  rules = [] as Rule[]
  parameters: ComplexModificationParameters
  title = 'Deno Karabiner'
  id = 'deno'

  constructor(options?: {
    title?: string
    id?: string
    parameters?: ComplexModificationParameters
  }) {
    if (options?.title) {
      this.title = options.title
    }
    if (options?.id) {
      this.id = options.id
    }
    this.parameters = options?.parameters ?? {
      'basic.simultaneous_threshold_milliseconds': 50,
      'basic.to_delayed_action_delay_milliseconds': 250,
      'basic.to_if_alone_timeout_milliseconds': 500,
      'basic.to_if_held_down_threshold_milliseconds': 50,
      'mouse_motion_to_scroll.speed': 100,
    }
  }

  addRule(rule: Rule | Rule[]) {
    if (Array.isArray(rule)) {
      this.rules.push(...rule)
    } else {
      this.rules.push(rule)
    }
  }

  getRules(): Rule[] {
    const rules: Rule[] = []

    for (const rule of this.rules) {
      rules.push(rule)
    }

    return rules
  }

  /**
   * In the format of
   * https://karabiner-elements.pqrs.org/docs/json/root-data-structure/#custom-json-file-in-configkarabinerassetscomplex_modifications
   */
  print() {
    console.log(JSON.stringify({ title: this.title, rules: this.getRules() }, null, '    '))
  }

  outputConfig(): string {
    return JSON.stringify({ title: this.title, rules: this.getRules() }, null, '  ')
  }

  outputProfile(profileName = 'Default profile'): KarabinerProfile {
    return {
      name: profileName ?? 'Default profile',
      complex_modifications: {
        parameters: this.parameters,
        rules: this.getRules(),
      },
    }
  }

  async writeToProfile(profileName = 'Default profile', configPath?: string) {
    if (!configPath) {
      const homeDir = Deno.env.get('HOME')
      configPath = homeDir + '/.config/karabiner/karabiner.json'
    }

    console.log(`\nWriting profile: '${profileName}'`)
    const content = await Deno.readTextFile(configPath)
    const config: KarabinerConfig | undefined = JSON.parse(content)

    let profile = config?.profiles?.find(profile => {
      return profile.name === profileName
    })

    if (profile) {
      profile = this.outputProfile(profileName)
    } else {
      console.log(`Profile not found, creating...`)
      config?.profiles?.push(this.outputProfile(profileName))
    }

    await Deno.writeTextFile(configPath, JSON.stringify(config, null, '  '))
    console.log('Done!')
  }
}
