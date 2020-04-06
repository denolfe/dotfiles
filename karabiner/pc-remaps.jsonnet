local utils = import 'utils.libsonnet';

{
    "description": "PC-Style Remaps",
    local nonApple = {
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
    },
    local onlyEditors = nonApple + {
        "conditions": [
            {
                "type": "frontmost_application_if",
                "bundle_identifiers": [
                    "^com\\.microsoft\\.VSCode",
                    "^com\\.jetbrains\\.",
                ],
            }
        ]
    },
    local ctrlBind(key, additionalMods=null) = nonApple +
    {
        "type": "basic",
        "from": {
            "key_code": key,
            "modifiers": {
                "mandatory": if additionalMods != null then ["left_control"] + additionalMods else ["left_control"]
            }
        },
        "to": [
            {
                "key_code": key,
                "modifiers": if additionalMods != null then ["left_command"] + additionalMods else ["left_command"]
            }
        ],
    },
    "manipulators": [
        // Copy
        ctrlBind("c") + {
            "conditions": [
                {
                    "type": "frontmost_application_unless",
                    "bundle_identifiers": [
                        "^com\\.googlecode\\.iterm2$",
                    ],
                }
            ]
        },
        ctrlBind("v"), // Paste
        ctrlBind("x"), // Cut
        ctrlBind("a"), // Select All
        ctrlBind("s"), // Save
        ctrlBind("s", ["left_shift"]), // Save As
        ctrlBind("r"), // Reload
        ctrlBind("n"), // New
        ctrlBind("z"), // Undo
        utils.bind(["left_control"], "y", "z", ["left_command", "left_shift"]) + nonApple, // Redo
        ctrlBind("f"), // Find
        ctrlBind("f", ["left_shift"]), // Find All
        ctrlBind("t"), // New Tab
        ctrlBind("w"), // Close Tab
        ctrlBind("i"), // Italic
        ctrlBind("b"), // Bold

        utils.bind(["left_control"], "delete_or_backspace", "delete_or_backspace", "left_alt") + nonApple, // Ctrl + Backspace
        utils.bind(["left_command"], "delete_or_backspace", "delete_or_backspace", "left_alt") + nonApple, // Ctrl + Backspace

        // Ctrl Arrows
        utils.bind(["left_control"], "left_arrow", "left_arrow", ["left_option"]) + nonApple,
        utils.bind(["left_control"], "right_arrow", "right_arrow", ["left_option"]) + nonApple,
        utils.bind(["left_control"], "down_arrow", "down_arrow", ["left_command"]) + nonApple,
        utils.bind(["left_control"], "up_arrow", "up_arrow", ["left_command"]) + nonApple,

        // Ctrl Arrows + Shift
        utils.bind(["left_control", "left_shift"], "left_arrow", "left_arrow", ["left_option", "left_shift"]) + nonApple,
        utils.bind(["left_control", "left_shift"], "right_arrow", "right_arrow", ["left_option", "left_shift"]) + nonApple,
        utils.bind(["left_control", "left_shift"], "down_arrow", "down_arrow", ["left_command", "left_shift"]) + nonApple,
        utils.bind(["left_control", "left_shift"], "up_arrow", "up_arrow", ["left_command", "left_shift"]) + nonApple,

        // Editors
        ctrlBind("d") + onlyEditors,
        ctrlBind("d", ["left_shift"]) + onlyEditors,
        ctrlBind("l") + {
            "conditions": [
                {
                    "type": "frontmost_application_unless",
                    "bundle_identifiers": [
                        "^com\\.googlecode\\.iterm2$",
                    ],
                },
                {
                    "type": "frontmost_application_if",
                    "bundle_identifiers": [
                        "^com\\.microsoft\\.VSCode",
                        "^com\\.jetbrains\\.",
                        "^com\\.google\\.Chrome$"
                    ],
                }
            ]
        },
        ctrlBind("p") + onlyEditors,
        ctrlBind("p", ["left_shift"]) + onlyEditors,
        utils.bind(["left_control"], "h", "f", ["left_option", "left_command"]) + onlyEditors,
        ctrlBind("h", ["left_shift"]) + onlyEditors,
        ctrlBind("l", ["left_shift"]) + onlyEditors,
        ctrlBind("k", ["left_shift"],) + onlyEditors,
        ctrlBind("e", ["left_shift"],) + onlyEditors,
        ctrlBind("slash") + onlyEditors,
    ]
}