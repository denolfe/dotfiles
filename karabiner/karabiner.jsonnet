/* Generate karabiner.json
*
*  jsonnet karabiner.jsonnet -o karabiner.json
*
*/

local ultraMods = {
    "mandatory": [
        "left_control",
        "left_shift",
        "left_option"
    ]
};

local ultraMove(from_key_code, to_key_code, to_key_mod=null) = {
    from: {
        key_code: from_key_code,
        modifiers: ultraMods
    },
    to: [
        {
            key_code: to_key_code,
            [if to_key_mod != null then "modifiers"]: [to_key_mod]
        },
    ],
    type: "basic"
};

local fnKey(from_key_code, to_key_code, is_consumer_key_code=true) = {
    from: {
        "key_code": from_key_code
    },
    to: {
        [if is_consumer_key_code then "consumer_key_code" else "key_code"]: to_key_code
    },
};

{
    "global": {
        "check_for_updates_on_startup": true,
        "show_in_menu_bar": true,
        "show_profile_name_in_menu_bar": false
    },
    "profiles": [
        {
            "complex_modifications": {
                "parameters": {
                    "basic.simultaneous_threshold_milliseconds": 50,
                    "basic.to_delayed_action_delay_milliseconds": 500,
                    "basic.to_if_alone_timeout_milliseconds": 100,
                    "basic.to_if_held_down_threshold_milliseconds": 500,
                    "mouse_motion_to_scroll.speed": 100
                },
                "rules": [
                    {
                        "manipulators": [
                            {
                                "description": "Change caps_lock to command+control+option+shift.",
                                "from": {
                                    "key_code": "caps_lock",
                                    "modifiers": {
                                        "optional": [
                                            "any"
                                        ]
                                    }
                                },
                                "to": [
                                    {
                                        "key_code": "left_shift",
                                        "modifiers": [
                                            "left_control",
                                            "left_option"
                                        ]
                                    }
                                ],
                                "to_if_alone": [
                                    {
                                        "key_code": "escape"
                                    }
                                ],
                                "type": "basic"
                            }
                        ]
                    },
                    {
                        "manipulators": [
                            {
                                "description": "Ultra + Delete for Forward Delete",
                                "from": {
                                    "key_code": "delete_or_backspace",
                                    "modifiers": ultraMods
                                },
                                "to": [
                                    {
                                        "key_code": "delete_forward"
                                    }
                                ],
                                "type": "basic"
                            }
                        ]
                    },
                    {
                        "description": "Ultra Cursor navigation",
                        "manipulators": [
                            ultraMove("h", "left_arrow"),
                            ultraMove("j", "down_arrow"),
                            ultraMove("k", "up_arrow"),
                            ultraMove("l", "right_arrow"),
                            ultraMove("n", "left_arrow", "left_command"), // Home
                            ultraMove("p", "right_arrow", "left_command"), // End
                            ultraMove("m", "left_arrow", "left_option"), // Left one word
                            ultraMove("period", "right_arrow", "left_option"), // Right one word,
                            ultraMove("u", "page_down"),
                            ultraMove("i", "page_up")
                        ]
                    }
                ]
            },
            "devices": [],
            "fn_function_keys": [
                fnKey("f1", "display_brightness_decrement"),
                fnKey("f2", "display_brightness_increment"),
                fnKey("f3", "mission_control", false),
                fnKey("f4", "launchpad", false),
                fnKey("f5", "illumination_decrement", false),
                fnKey("f6", "illumination_increment", false),
                fnKey("f7", "rewind"),
                fnKey("f8", "play_or_pause"),
                fnKey("f9", "fastforward"),
                fnKey("f10", "mute"),
                fnKey("f11", "volume_decrement"),
                fnKey("f12", "volume_increment"),
            ],
            "name": "Default profile",
            "parameters": {
                "delay_milliseconds_before_open_device": 1000
            },
            "selected": true,
            "simple_modifications": [],
            "virtual_hid_keyboard": {
                "country_code": 0,
                "mouse_key_xy_scale": 100
            }
        }
    ]
}
