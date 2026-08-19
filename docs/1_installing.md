# Installing

This guide covers how to install Retribution on Android and iOS.

## Android (non-root)

1. Download the latest `retribution-manager-*.apk` from [retribution-manager releases](https://github.com/Retribution-Mod/retribution-manager/releases/latest).
2. Install the APK and open it.
3. The manager will show the latest supported Discord versions. Tap **Install** to download, patch, and install Discord.
4. Once installed, open Discord. Retribution should load automatically.

> **Tip:** If a new Retribution Manager version is available, the manager will prompt you to update itself when you open it.

## Android (root with Xposed/LSPosed)

1. Download the latest `retribution-xposed` APK from [retribution-xposed releases](https://github.com/Retribution-Mod/retribution-xposed/releases/latest).
2. Install the APK and enable the module in your Xposed/LSPosed manager.
3. Make sure the module is applied to the official Discord app.
4. Open Discord. Retribution should load automatically.

## iOS (sideloading)

1. Download the latest `Retribution.ipa` from [retribution-tweak releases](https://github.com/Retribution-Mod/retribution-tweak/releases/latest). The release is tied to a specific Discord version (for example, `v340.0`).
2. Use your preferred sideloading tool to install the IPA.
3. Open the sideloaded Discord app. Retribution will download the latest bundle and load.

## iOS (jailbreak / TrollStore)

1. Download the appropriate `.deb` from [retribution-tweak releases](https://github.com/Retribution-Mod/retribution-tweak/releases/latest):
   - `iphoneos-arm.deb` for rootful jailbreaks.
   - `iphoneos-arm64.deb` for rootless jailbreaks.
2. Install the `.deb` with your package manager (TrollStore, Filza, Sileo, Zebra, etc.).
3. The tweak will inject into the official Discord app on launch.

## After installation

- The first launch may take a moment while Retribution downloads the latest JavaScript bundle.
- If Retribution does not appear, force-close Discord and reopen it.
