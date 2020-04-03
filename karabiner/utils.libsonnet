{
    bind(modifier, from_key_code, to_key_code, to_key_mods=null):: {
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
    }
}