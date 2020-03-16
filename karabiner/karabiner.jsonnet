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

local hyperMods = {
    "mandatory": [
        "left_control",
        "left_shift",
        "left_option",
        "left_command"
    ]
};

local bind(modifier, from_key_code, to_key_code, to_key_mods=null) = {
    from: {
        key_code: from_key_code,
        modifiers: modifier
    },
    to: [
        {
            key_code: to_key_code,
            [if to_key_mods != null then "modifiers"]: to_key_mods
        },
    ],
    type: "basic"
};

local ultraBind(from_key_code, to_key_code, to_key_mods=null) = bind(ultraMods, from_key_code, to_key_code, to_key_mods);
local hyperBind(from_key_code, to_key_code, to_key_mods=null) = bind(hyperMods, from_key_code, to_key_code, to_key_mods);

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
                        "description": "Ultra Directional Bindings",
                        "manipulators": [
                            // Arrows
                            ultraBind("h", "left_arrow"),
                            ultraBind("j", "down_arrow"),
                            ultraBind("k", "up_arrow"),
                            ultraBind("l", "right_arrow"),

                            // Arrows + Shift
                            hyperBind("h", "left_arrow", ["left_shift"]),
                            hyperBind("j", "down_arrow", ["left_shift"]),
                            hyperBind("k", "up_arrow", ["left_shift"]),
                            hyperBind("l", "right_arrow", ["left_shift"]),

                            ultraBind("n", "left_arrow", ["left_command"]), // Home
                            ultraBind("p", "right_arrow", ["left_command"]), // End
                            ultraBind("m", "left_arrow", ["left_option"]), // Left one word
                            ultraBind("period", "right_arrow", ["left_option"]), // Right one word

                            hyperBind("n", "left_arrow", ["left_command", "left_shift"]), // Home + Shift
                            hyperBind("p", "right_arrow", ["left_command", "left_shift"]), // End + Shift
                            hyperBind("m", "left_arrow", ["left_option", "left_shift"]), // Left one word + Shift
                            hyperBind("period", "right_arrow", ["left_option", "left_shift"]), // Right one word + Shift

                            ultraBind("u", "page_down"),
                            ultraBind("i", "page_up"),
                        ]
                    },
                    {
                        "description": "Ultra Remaps (forward delete, spaces)",
                        "manipulators": [
                            ultraBind("delete_or_backspace", "delete_forward"), // Forward delete
                            ultraBind("s", "left_arrow", "left_control"),  // Spaces left
                            ultraBind("d", "right_arrow", "left_control")  // Spaces right
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
