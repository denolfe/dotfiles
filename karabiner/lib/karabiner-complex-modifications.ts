import { Rule, KarabinerConfig, ComplexModificationParameters, KarabinerGlobals } from './types.ts'

export class KarabinerComplexModifications {
  private rules = [] as Rule[]
  private global: KarabinerGlobals
  private parameters: ComplexModificationParameters

  constructor(options?: { parameters?: ComplexModificationParameters }) {
    this.global = {
      ask_for_confirmation_before_quitting: true,
      check_for_updates_on_startup: true,
      show_in_menu_bar: true,
      show_profile_name_in_menu_bar: false,
      unsafe_ui: false,
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

  printConfig() {
    console.log(this.outputConfig())
  }

  private outputConfig(): string {
    const fullConfig: KarabinerConfig = {
      global: this.global,
      profiles: [
        {
          name: 'Default profile',
          selected: true,
          complex_modifications: {
            parameters: this.parameters,
            rules: this.rules,
          },
        },
      ],
    }
    return JSON.stringify(fullConfig, null, '  ')
  }

  writeConfig(): void {
    const config = this.outputConfig()

    // Write to .dotfiles dir for version control
    const __dirname = new URL('.', import.meta.url).pathname
    Deno.writeTextFileSync(`${__dirname}/../karabiner.json`, config)

    // Write to karabiner config location
    const configPath = `${Deno.env.get('HOME')}/.config/karabiner/karabiner.json`
    console.log(`Writing config to ${configPath}`)
    Deno.writeTextFileSync(configPath, config)
    console.log('Done!')
  }
}
