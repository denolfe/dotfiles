/* Generate karabiner.json
*
*  jsonnet karabiner.jsonnet -o karabiner.json
*
*/

# Mapped to CapsLock below
local ultraMods = [
    "left_control",
    "left_shift",
    "left_option"
];

# CapsLock + Cmd
local hyperMods = [
    "left_control",
    "left_shift",
    "left_option",
    "left_command"
];

local bind(modifier, from_key_code, to_key_code, to_key_mods=null) = {
    from: {
        key_code: from_key_code,
        modifiers: {
            mandatory: modifier
        }
    },
    to: [
        {
            key_code: to_key_code,
            [if to_key_mods != null then "modifiers"]: to_key_mods
        },
    ],
    type: "basic"
};

local ultra(from_key_code, to_key_code, to_key_mods=null) = bind(ultraMods, from_key_code, to_key_code, to_key_mods);
local hyper(from_key_code, to_key_code, to_key_mods=null) = bind(hyperMods, from_key_code, to_key_code, to_key_mods);

# Main config
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
                    "basic.to_if_alone_timeout_milliseconds": 150,  // Default 1000
                    "basic.to_if_held_down_threshold_milliseconds": 500,
                    "mouse_motion_to_scroll.speed": 100
                },
                "rules": [
                    {
                        "description": "Change caps_lock to command+control+option+shift",
                        "manipulators": [
                            {
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
                        "description": "Ultra Directional Bindings",
                        "manipulators": [
                            // Arrows
                            ultra("h", "left_arrow"),
                            ultra("j", "down_arrow"),
                            ultra("k", "up_arrow"),
                            ultra("l", "right_arrow"),

                            // Arrows + Shift
                            hyper("h", "left_arrow", ["left_shift"]),
                            hyper("j", "down_arrow", ["left_shift"]),
                            hyper("k", "up_arrow", ["left_shift"]),
                            hyper("l", "right_arrow", ["left_shift"]),

                            ultra("n", "left_arrow", ["left_command"]), // Home
                            ultra("p", "right_arrow", ["left_command"]), // End
                            ultra("m", "left_arrow", ["left_option"]), // Left one word
                            ultra("period", "right_arrow", ["left_option"]), // Right one word

                            hyper("n", "left_arrow", ["left_command", "left_shift"]), // Home + Shift
                            hyper("p", "right_arrow", ["left_command", "left_shift"]), // End + Shift
                            hyper("m", "left_arrow", ["left_option", "left_shift"]), // Left one word + Shift
                            hyper("period", "right_arrow", ["left_option", "left_shift"]), // Right one word + Shift

                            ultra("u", "page_down"),
                            ultra("i", "page_up"),
                            hyper("u", "down_arrow", ["left_command"]), // End of page
                            hyper("i", "up_arrow", ["left_command"]), // Top of page
                        ]
                    },
                    {
                        "description": "Ultra Remaps (forward delete, spaces, mission control)",
                        "manipulators": [
                            ultra("delete_or_backspace", "delete_forward"), // Forward delete
                            hyper("delete_or_backspace", "delete_forward", ["fn", "left_option"]), // Forward delete word
                            ultra("a", "left_arrow", ["left_control"]),  // Spaces left
                            ultra("d", "right_arrow", ["left_control"]), // Spaces right

                            ultra("s", "mission_control"), // Mission Control
                            hyper("s", "down_arrow", ["left_control"]) // App windows
                        ]
                    },
                    {
                        "description": "Chrome-specific Ctrl-Tab Remap",
                        local chromeOnly = { "conditions": [{
                                "type": "frontmost_application_if",
                                "bundle_identifiers": [
                                    "^com\\.google\\.Chrome$"
                                ]
                            }]
                        },
                        "manipulators": [
                            hyper("a", "tab", ["left_control", "left_shift"]) + chromeOnly,
                            hyper("d", "tab", ["left_control"]) + chromeOnly,
                        ],
                    },
                    {
                        "description": "Swap Command and Option on External Keyboards",
                        local swaps = [
                            { from: "left_command", to: "left_option" },
                            { from: "left_option", to: "left_command"}
                        ],
                        "manipulators": [
                            {
                                "conditions": [
                                    {
                                        "type": "device_unless",
                                        "identifiers": [
                                            {
                                                "vendor_id": 1452
                                            }
                                        ]
                                    }
                                ],
                                "type": "basic",
                                "from": {
                                    "key_code": swap.from,
                                    "modifiers": {
                                        "optional": [
                                            "any"
                                        ]
                                    }
                                },
                                "to": [
                                    {
                                        "key_code": swap.to
                                    }
                                ]
                        } for swap in swaps
                        ]
                    }
                ]
            },
            "devices": [],
            # Mapping of function keys
            local fnKey(from_key_code, to_key_code, is_consumer_key_code=true) = {
                from: {
                    "key_code": from_key_code
                },
                to: {
                    [if is_consumer_key_code then "consumer_key_code" else "key_code"]: to_key_code
                },
            },

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
