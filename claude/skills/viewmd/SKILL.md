---
name: viewmd
description: Use when the user wants to preview or read a rendered markdown file in an adjacent tmux pane (via the viewmd CLI) - e.g. to view a plan, doc, README, or markdown you just generated side-by-side while continuing to work in the current pane.
disable-model-invocation: true
---

# View Markdown in a tmux Pane

Render a markdown file with the `viewmd` TUI in a split tmux pane, keeping focus on the current pane.

## Steps

1. **Resolve the file.**
   - If the user gave a path, use it.
   - If they named/described content you generated but haven't saved, write it to a file first.
   - **If nothing was passed, use the conversation:** take the most recent substantial markdown-style output you produced (a plan, summary, doc, table, code-heavy answer) and write it verbatim to `/tmp/viewmd-<slug>.md`. If the last output wasn't markdown or there's nothing suitable, ask what to view instead of guessing.
   - Save to a real path when the user wants to keep it, otherwise `/tmp/viewmd-<slug>.md`.
2. **Run the helper:**

   ```bash
   ~/.claude/skills/viewmd/viewmd-pane.sh "<file.md>"
   ```

3. **Report the printed result** (which pane it opened/reused) in one sentence. Do not steal focus or read the pane back.

## Behavior

- Runs `viewmd <file>` in a pane to the right; focus stays where you are.
- **Target order (all within the caller's window):**
  1. An existing viewmd pane (marked `@viewmd`) that is idle or still running viewmd - reused. If that pane has since been used to run your own command, its claim is dropped and it is left alone.
  2. Else an idle sibling pane - a bare shell with nothing running - taken over. Preferring one to the right.
  3. Else a new pane is split off.
- **Never touches:** the caller's own pane, panes running an app (editor, TUI, another agent), or any shell with a command running - including a previously-marked pane you have reused. Only a bare, idle shell (or our own viewer) is replaced.
- **Not in tmux:** the script prints the plain `viewmd "<file>"` command to run manually instead of splitting.

## Notes

- `viewmd` is interactive (quit with `q`); it must run in its own pane, never inline in this session.
- Only pass one file. For a different doc, invoke again.
