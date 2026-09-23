import { describe, expect, test } from 'bun:test'
import inputBoxExtension from '../index'

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '')
}

const appTheme = {
  fg: (_color: string, text: string) => text,
  bg: (_color: string, text: string) => text,
}

const editorTheme = {
  borderColor: (text: string) => text,
  selectList: {},
}

const tui = {
  terminal: { rows: 40 },
  requestRender() {},
}

const keybindings = {
  matches: () => false,
  getBinding: () => undefined,
}

function registerExtension(): any {
  let factory: any
  inputBoxExtension({
    on(event: string, handler: any) {
      if (event === 'session_start') {
        handler({}, {
          ui: {
            theme: appTheme,
            setEditorComponent(nextFactory: any) {
              factory = nextFactory
            },
          },
        })
      }
    },
  } as any)
  return factory
}

describe('input box extension', () => {
  test('registers a custom editor on session start', () => {
    expect(registerExtension()).toBeFunction()
  })

  test('renders input with user-message padding and leading caret', () => {
    const factory = registerExtension()
    const editor = factory(tui, editorTheme, keybindings)
    editor.setText('Ask Pi to do anything')

    const output = editor.render(60).map((line: string) => stripAnsi(line).trimEnd())

    expect(output).toEqual([
      '',
      '› Ask Pi to do anything',
      '',
    ])
  })

  test('keeps continuation lines aligned after the caret', () => {
    const factory = registerExtension()
    const editor = factory(tui, editorTheme, keybindings)
    editor.setText('alpha bravo charlie delta')

    const output = editor.render(20).map((line: string) => stripAnsi(line).trimEnd())

    expect(output).toEqual([
      '',
      '› alpha bravo',
      '  charlie delta',
      '',
    ])
  })

  test('reapplies the background after editor cursor resets', () => {
    const factory = registerExtension()
    const editor = factory(tui, editorTheme, keybindings)
    editor.focused = true
    editor.setText('alpha')

    const rawOutput = editor.render(20).join('\n')

    expect(rawOutput).toContain('\x1b[0m\x1b[48;2;45;45;48m')
  })
})
