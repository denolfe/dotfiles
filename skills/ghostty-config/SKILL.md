---
name: ghostty-config
description: Use when configuring Ghostty terminal emulator, working with ghostty config files, or looking up Ghostty settings and options.
---

# Ghostty Terminal Configuration

Guide for configuring Ghostty terminal emulator with local documentation access.

## When to Use This Skill

Use this skill when:

- Working with Ghostty configuration files
- Looking up valid configuration options
- Troubleshooting Ghostty settings
- Finding available fonts or themes
- Understanding Ghostty-specific features

## Quick Reference

### Access Local Documentation

Ghostty includes comprehensive built-in documentation:

**Full configuration reference with inline docs:**

```bash
ghostty +show-config --default --docs
```

**List available fonts:**

```bash
ghostty +list-fonts
```

**Search for specific config options:**

```bash
ghostty +show-config --default --docs | grep -A 10 "keyword"
```

### Configuration File Location

In this dotfiles repository, Ghostty config is managed at:

- Source: `config/ghostty/config`
- Installed: `~/.config/ghostty/config`

### Common Configuration Patterns

**Font configuration:**

```bash
# List available fonts first
ghostty +list-fonts

# Then configure in config file
font-family = Maple Mono NF
font-size = 14
```

**Theme/Colors:**

```bash
# Search for color-related options
ghostty +show-config --default --docs | grep -i "color"
```

**Key bindings:**

```bash
# Search for keybind options
ghostty +show-config --default --docs | grep -i "keybind"
```

## Searching Documentation

**Find specific option documentation:**

```bash
# Example: Find all font-related options
ghostty +show-config --default --docs | grep -B 2 -A 20 "^font-"
```

**Search by keyword:**

```bash
# Example: Find clipboard options
ghostty +show-config --default --docs | grep -i "clipboard" -A 10
```

**List all available options:**

```bash
# Get just the config keys without docs
ghostty +show-config --default | grep "^[a-z]" | cut -d= -f1
```

## Validation

**Test configuration syntax:**

```bash
# Ghostty will report errors on startup
ghostty --config-file=path/to/config
```

**View current configuration:**

```bash
# Shows active config (after applying defaults + user config)
ghostty +show-config
```

## Common Configuration Categories

Key categories (use documentation search for complete details):

- **Font:** `font-family`, `font-size`, `font-style`, `font-feature`
- **Colors:** `background`, `foreground`, `palette`, `theme`
- **Window:** `window-padding-x/y`, `window-theme`, `window-decoration`
- **Shell:** `shell-integration-features`, `command`, `working-directory`
- **Keybinds:** `keybind = trigger=action[:parameter]`
- **Bell:** `bell-features`, `bell-audio-path`, `bell-audio-volume`
- **Performance:** `renderer`, `vsync`
- **macOS:** `macos-titlebar-style`, `macos-option-as-alt`

## Example: Adding a Font

1. **List available fonts:**

   ```bash
   ghostty +list-fonts | grep -i "JetBrains"
   ```

2. **Check font configuration docs:**

   ```bash
   ghostty +show-config --default --docs | grep -A 40 "^font-family"
   ```

3. **Add to config:**

   ```
   font-family = JetBrains Mono
   font-family = Apple Color Emoji  # Fallback for emoji
   font-size = 14
   ```

4. **Reload config** (Ghostty auto-reloads, or use `ctrl+c>r` keybind if configured)

## Example: Custom Keybindings

1. **Find keybind documentation:**

   ```bash
   ghostty +show-config --default --docs | grep -B 10 -A 30 "^keybind ="
   ```

2. **Keybind syntax:**

   ```
   keybind = [prefix:]trigger=action[:parameter]
   ```

3. **Add custom bindings:**
   ```
   keybind = ctrl+shift+c=copy_to_clipboard
   keybind = ctrl+shift+v=paste_from_clipboard
   keybind = ctrl+c>v=new_split:right
   ```

## Example: Configuring Bell

1. **Search bell documentation:**

   ```bash
   ghostty +show-config --default --docs | grep -A 50 "^# Bell features"
   ```

2. **Available bell features:**

   - `system` - System notification (GTK only)
   - `audio` - Custom sound (GTK only)
   - `attention` - Bounce dock icon on macOS (default: enabled)
   - `title` - Add 🔔 emoji to title (default: enabled)
   - `border` - Display border (GTK only)

3. **Configure bell:**
   ```
   # Only show title emoji, no dock bounce
   bell-features = no-attention,title
   ```

## Configuration Format

**Basic syntax:**

```
# Comments start with hash
key = value

# Boolean values
some-feature = true
other-feature = false

# Multiple values - repeat the key
font-family = JetBrains Mono
font-family = Apple Color Emoji

# Empty value = use default
font-family =
```

**No quotes needed** for most values (unlike TOML/YAML):

```
# Correct
font-family = JetBrains Mono

# Also works, but unnecessary
font-family = "JetBrains Mono"
```

**Keybind prefixes:**

- `global:` - System-wide (requires accessibility permissions)
- `all:` - Apply to all surfaces
- `unconsumed:` - Pass to program if not consumed
- `performable:` - Only if action can be performed

## Tips

- Ghostty automatically reloads configuration on file changes
- Use `ghostty +show-config` to verify active settings
- All documentation is built-in - no internet required
- Config format is custom (not TOML/YAML/INI)
- Comments start with `#`
- Boolean values: `true` or `false`
- Multiple values: repeat the key multiple times
- Empty value (`key =`) means "use default"

## Troubleshooting

**Config not loading:**

- Check file location: `~/.config/ghostty/config`
- Verify syntax: generally no quotes needed
- Check Ghostty logs for errors
- Unknown fields are silently ignored

**Font not found:**

- Use `ghostty +list-fonts` to find exact font name
- Names are case-sensitive
- Some fonts require full family name (e.g., "Maple Mono NF" not "Maple Mono")

**Colors not working:**

- Verify hex format: `#RRGGBB` or `#RRGGBBAA`
- Check terminal theme compatibility
- Use `ghostty +show-config` to see active values

**Keybindings not working:**

- Check for conflicts with system/other apps
- Verify action name is correct (use docs to find valid actions)
- Some actions are platform-specific (GTK only, macOS only)
- Global keybinds require accessibility permissions

## Additional Resources

- Built-in docs: `ghostty +show-config --default --docs`
- Man pages: `man ghostty`
- This repo's config: `config/ghostty/config`
- List fonts: `ghostty +list-fonts`
- Show active config: `ghostty +show-config`
