export type Key =
  | 'right_command'
  | 'right_control'
  | 'right_option'
  | 'right_shift'
  | 'right_alt'
  | 'left_command'
  | 'left_control'
  | 'left_option'
  | 'left_shift'
  | 'left_alt'
  | 'left_gui'
  | 'caps_lock'
  | 'return_or_enter'
  | 'spacebar'
  | 'left_arrow'
  | 'right_arrow'
  | 'up_arrow'
  | 'down_arrow'
  | 'grave_accent_and_tilde'
  | 'non_us_pound'
  | 'delete_or_backspace'
  | 'delete_forward'
  | 'non_us_backslash'
  | 'application'
  | 'semicolon'
  | 'quote'
  | 'escape'
  | 'open_bracket'
  | 'close_bracket'
  | 'slash'
  | 'backslash'
  | 'period'
  | 'comma'
  | 'equal_sign'
  | 'hyphen'
  | 'insert'
  | 'pause'
  | 'home'
  | 'end'
  | 'page_up'
  | 'page_down'
  | 'scroll_lock'
  | 'print_screen'
  | 'vk_none'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '0'
  | 'q'
  | 'w'
  | 'e'
  | 'r'
  | 't'
  | 'y'
  | 'u'
  | 'i'
  | 'o'
  | 'p'
  | 'a'
  | 's'
  | 'd'
  | 'f'
  | 'g'
  | 'h'
  | 'j'
  | 'k'
  | 'l'
  | 'z'
  | 'x'
  | 'c'
  | 'v'
  | 'b'
  | 'n'
  | 'm'
  | 'fn'
  | 'display_brightness_decrement'
  | 'display_brightness_increment'
  | 'mission_control'
  | 'launchpad'
  | 'illumination_decrement'
  | 'illumination_increment'
  | 'rewind'
  | 'play_or_pause'
  | 'fastforward'
  | 'mute'
  | 'volume_decrement'
  | 'volume_increment'
  | 'tab'
  | 'f1'
  | 'f2'
  | 'f3'
  | 'f4'
  | 'f5'
  | 'f6'
  | 'f7'
  | 'f8'
  | 'f9'
  | 'f10'
  | 'f11'
  | 'f12'
  | 'keypad_1'
  | 'keypad_2'
  | 'keypad_3'
  | 'keypad_0'
  | 'keypad_4'
  | 'keypad_5'
  | 'keypad_6'
  | 'keypad_7'
  | 'keypad_8'
  | 'keypad_slash'
  | 'keypad_asterisk'
  | 'keypad_9'
  | 'keypad_period'
  | 'keypad_hyphen'
  | 'keypad_plus'

export interface KeyPressFrom {
  key_code: Key
  modifiers?: {
    mandatory?: Key[]
    optional?: (Key | 'any')[]
  }
}

export interface KeyPressTo {
  key_code?: Key
  shell_command?: string
  modifiers?: Key[]
  lazy?: boolean
  halt?: boolean
  hold_down_milliseconds?: number
  set_variable?: {
    name: string
    value: number | string
  }
}

/**
 * https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/conditions/frontmost-application/
 */
export interface FrontmostApplicationCondition {
  type: 'frontmost_application_if' | 'frontmost_application_unless'
  description?: string
  bundle_identifiers?: string[]
  file_paths?: string[]
}

/**
 * https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/conditions/device/
 */
export interface DeviceCondition {
  type: 'device_if' | 'device_unless'
  identifiers: {
    vendor_id?: number
    product_id?: number
    location_id?: boolean
    is_keyboard?: boolean
    is_pointing_device?: boolean
  }[]
}

/**
 * https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/conditions/variable/
 */
export interface VariableCondition {
  type: 'variable_if' | 'variable_unless'
  name: string
  value: number | string
}

/**
 * https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/conditions/
 */
export type Condition = FrontmostApplicationCondition | DeviceCondition | VariableCondition

export interface AltCondition {
  disable: Condition[]
  enable: Condition[]
}

/**
 * https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/
 */
export interface Manipulator {
  type: 'basic'
  from: KeyPressFrom
  to?: KeyPressTo[]
  to_if_alone?: KeyPressTo[]
  to_after_key_up?: KeyPressTo[]
  to_if_held_down?: KeyPressTo[]

  /**
   * https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/to-delayed-action/
   */
  to_delayed_action?: {
    to_if_invoked?: KeyPressTo[]
    to_if_canceled?: KeyPressTo[]
  }

  conditions?: Condition[]
}

export interface HyperKeyConfig {
  id: string
  description: string
  from: KeyPressFrom
  to_if_alone?: KeyPressTo[]
}

export interface Rule {
  description: string
  manipulators: Manipulator[]
}

export interface ComplexModificationParameters {
  'basic.to_if_alone_timeout_milliseconds'?: number
  'basic.to_delayed_action_delay_milliseconds'?: number
  'basic.to_if_held_down_threshold_milliseconds'?: number
  'basic.simultaneous_threshold_milliseconds'?: number
  'mouse_motion_to_scroll.speed'?: number
}

export interface KarabinerProfile {
  name?: string
  selected: boolean
  complex_modifications?: {
    parameters?: ComplexModificationParameters
    rules?: Rule[]
  }
}

export interface KarabinerGlobals {
  ask_for_confirmation_before_quitting: boolean
  check_for_updates_on_startup: boolean
  show_in_menu_bar: boolean
  show_profile_name_in_menu_bar: boolean
  unsafe_ui: boolean
}

export interface KarabinerConfig {
  global?: KarabinerGlobals
  profiles?: KarabinerProfile[]
}
