import * as fs from 'fs'
import { Rule, KarabinerConfig, ComplexModificationParameters, KarabinerProfile } from './types'

export class KarabinerComplexModifications {
  rules = [] as Rule[]
  parameters: ComplexModificationParameters
  title = 'Deno Karabiner'
  id = 'deno'

  constructor(options?: { title?: string; id?: string }) {
    if (options?.title) {
      this.title = options.title
    }
    if (options?.id) {
      this.id = options.id
    }
    this.parameters = {
      'basic.simultaneous_threshold_milliseconds': 50,
      'basic.to_delayed_action_delay_milliseconds': 250,
      'basic.to_if_alone_timeout_milliseconds': 500,
      'basic.to_if_held_down_threshold_milliseconds': 50,
      'mouse_motion_to_scroll.speed': 100,
    }
  }

  setParameters(parameters: ComplexModificationParameters) {}

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
    return JSON.stringify({ title: this.title, rules: this.getRules() }, null, '    ')
  }

  outputProfile(): KarabinerProfile {
    return {
      name: 'Default profile',
      complex_modifications: {
        parameters: this.parameters,
        rules: this.getRules(),
      },
    }
  }
}
