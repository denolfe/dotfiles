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
    local CtrlCmdSwap(key, additionalMods=null) = nonApple +
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
        CtrlCmdSwap("c") + {
            "conditions": [
                {
                    "type": "frontmost_application_unless",
                    "bundle_identifiers": [
                        "^com\\.googlecode\\.iterm2$",
                    ],
                }
            ]
        },
        CtrlCmdSwap("v"), // Paste
        CtrlCmdSwap("x"), // Cut
        CtrlCmdSwap("a"), // Select All
        CtrlCmdSwap("s"), // Save
        CtrlCmdSwap("s", ["left_shift"]), // Save As
        CtrlCmdSwap("r"), // Reload
        CtrlCmdSwap("n"), // New
        CtrlCmdSwap("z"), // Undo
        utils.bind(["left_control"], "y", "z", ["left_command", "left_shift"]) + nonApple, // Redo
        CtrlCmdSwap("f"), // Find
        CtrlCmdSwap("f", ["left_shift"]), // Find All
        CtrlCmdSwap("t"), // New Tab
        CtrlCmdSwap("w"), // Close Tab
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
        CtrlCmdSwap("d") + onlyEditors,
        CtrlCmdSwap("d", ["left_shift"]) + onlyEditors,
        CtrlCmdSwap("l") + {
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
                    ],
                }
            ]
        },
        CtrlCmdSwap("p") + onlyEditors,
        CtrlCmdSwap("p", ["left_shift"]) + onlyEditors,
        utils.bind(["left_control"], "h", "f", ["left_option", "left_command"]) + onlyEditors,
        CtrlCmdSwap("h", ["left_shift"]) + onlyEditors,
        CtrlCmdSwap("l", ["left_shift"]) + onlyEditors,
        CtrlCmdSwap("k", ["left_shift"],) + onlyEditors,
        CtrlCmdSwap("e", ["left_shift"],) + onlyEditors,
        CtrlCmdSwap("slash") + onlyEditors,
    ]
}