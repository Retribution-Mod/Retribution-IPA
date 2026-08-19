# Deep links

Retribution supports `retribution://` deep links for quickly installing add-ons.

## Supported hosts

| Host | Purpose | Example payload |
|------|---------|-----------------|
| `plugin` | Install a plugin from a URL | `retribution://plugin?url=https%3a%2f%2fexample.com%2fplugin.js` |
| `theme` | Install a theme from a URL | `retribution://theme?url=https%3a%2f%2fexample.com%2ftheme.json` |
| `font` | Install a font from a URL | `retribution://font?url=https%3a%2f%2fexample.com%2ffont.json` |

## How they work

1. The `retribution://` link is opened by a device that has Retribution installed.
2. The manager, Xposed module, or iOS tweak forwards the link to the patched Discord app.
3. Retribution parses the `url` query parameter and prompts the user to install the add-on.

## Using links in a browser

On Android, the most reliable browser link is the `intent://` form:

```html
<a href="intent://plugin?url=https%3a%2f%2fexample.com%2fplugin.js#Intent;scheme=retribution;package=app.retribution.manager;end">
  Install plugin
</a>
```

A plain custom-scheme link also works in most browsers:

```html
<a href="retribution://plugin?url=https%3a%2f%2fexample.com%2fplugin.js">
  Install plugin
</a>
```

## Sharing links

When sharing an add-on with others, always provide the `retribution://` link, not the direct download URL. This ensures the recipient's Retribution installation handles the install prompt and error handling.
