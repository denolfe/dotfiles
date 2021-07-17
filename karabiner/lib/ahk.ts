import { Key, KeyPressTo, KeyPressFrom } from 'https://deno.land/x/karabiner@v0.2.0/karabiner.ts';

const ahkMod = ['+', '^', '#', '!'] as const
type AhkMod = typeof ahkMod[number]

/**
 * Ahk-modifiers with Karabiner key code
 * ie. +left_arrow, ^left_arrow, !left_arrow
 */
export type AhkKey = Key | `${'+' | '^' | '#' | '!' | '+#' | '!#' | '+!#' | '+!'}${Key}`

function formatKey(key: AhkKey): { key: Key, modifiers: Key[] } {
  const modifiers: Key[] = []
  let stringKey: string = key.toString()

  const modMap: Record<AhkMod, Key> = {
    '+': 'left_shift',
    '#': 'left_command',
    '^': 'left_control',
    '!': 'left_option',
  }

  ahkMod.forEach(r => {
    if (stringKey.includes(r)) {
      modifiers.push(modMap[r])
      stringKey = stringKey.replace(r, '')
    }
  })

  return {
    key: stringKey as Key,
    modifiers
  }
}

export function parseTo(key: AhkKey): KeyPressTo {
  const { key: stringKey, modifiers } = formatKey(key)

  return {
    key_code: stringKey,
    modifiers
  }
}

export function parseFrom(key: AhkKey): KeyPressFrom {
  const { key: stringKey, modifiers } = formatKey(key)

  return {
    key_code: stringKey,
    modifiers: {
      mandatory: modifiers
    }
  }
}