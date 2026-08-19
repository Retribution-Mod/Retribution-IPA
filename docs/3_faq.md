# Frequently Asked Questions

## What is Retribution?

Retribution is a client modification for Discord on Android and iOS. It lets you add plugins, themes, and fonts to customize Discord's look and behavior.

## Is Retribution safe?

Like all client modifications, Retribution is unofficial and not affiliated with Discord. It is open-source and the code is available for review, but using it may violate Discord's Terms of Service. Use it at your own risk.

## Does Retribution work with the latest Discord version?

Not always immediately. Retribution releases are tied to specific Discord versions. Check the [retribution-tweak releases](https://github.com/Retribution-Mod/retribution-tweak/releases) for the latest supported iOS version and the manager for Android.

## How do I update Retribution?

- **Android (manager)**: the manager checks for updates on open and will prompt you to install a new version.
- **Android (Xposed)**: update the `retribution-xposed` APK.
- **iOS (sideload)**: install the latest `Retribution.ipa` for your Discord version.
- **iOS (jailbreak / TrollStore)**: update the `.deb` package.

The JavaScript bundle itself is downloaded automatically from the latest [retribution-bundle release](https://github.com/Retribution-Mod/retribution-bundle/releases/latest).

## How do I install plugins, themes, or fonts?

You can install add-ons in a few ways:

1. **In-app browser / add-on store**: open Retribution settings and browse for plugins, themes, or fonts.
2. **Deep links**: use a `retribution://` link such as:
   - `retribution://plugin?url=https%3a%2f%2fexample.com%2fplugin.js`
   - `retribution://theme?url=https%3a%2f%2fexample.com%2ftheme.json`
   - `retribution://font?url=https%3a%2f%2fexample.com%2ffont.json`
3. **From the settings pages**: go to **Retribution Settings** > **Plugins**, **Themes**, or **Fonts** and install manually from a URL.

## What is a deep link?

A deep link is a special URL that opens Retribution and installs a plugin, theme, or font automatically. Clicking a `retribution://` link from a supported app or web page will open Discord with the install prompt.

## Can I use plugins from Vendetta / Revenge / Bunny?

Retribution is compatible with plugins built for the Vendetta/Bunny/Revenge plugin API. However, some plugins may require updates to work with newer Discord versions or Retribution-specific features.

## Retribution isn't loading / settings aren't showing

1. Force-close Discord and reopen it.
2. Make sure you have an active internet connection.
3. Check that your Discord version matches the supported version for your Retribution build.
4. On iOS, check that the tweak or sideloaded app has network access.
5. Clear the JavaScript bundle in **Retribution Settings** > **Developer** > **Clear JS bundle** if available.

## How do I build the bundle myself?

See the [Building](./2_building.md) documentation.

## Where can I get help?

- Visit the [GitHub issues](https://github.com/Retribution-Mod/Retribution/issues) for bug reports and feature requests.
- Join the community Discord linked in the main README.
