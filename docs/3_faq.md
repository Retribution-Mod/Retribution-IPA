# Field Manual: Retribution

A no-bullshit guide to what Retribution is, what it isn't, and how to keep it running.

---

## What is Retribution?

**The short version:** Retribution is a client modification for Discord on Android and iOS. It lets you load plugins, themes, and fonts to make Discord behave and look the way you want.

**The longer version:** It is a continuation of the Bunny project, built on the same loader ideas as Vendetta and Pyoncord. It does not replace Discord on a server level — it runs inside the Discord app you already know, after the manager or tweak has done its job.

---

## Is Retribution safe?

Nothing that modifies a client app is "officially safe." Retribution is open source and the code is public, but it is not affiliated with Discord. Discord can update its app, change its Terms of Service, or take action against accounts that use client mods. We are not responsible for that.

Use it because you want it, not because you think it is invisible.

---

## Will Retribution work on the latest Discord?

Not automatically. Retribution releases are tied to specific Discord versions. The manager and tweak both target a known-good Discord build. If Discord updates and Retribution has not been updated for it, wait.

- **Android:** the manager shows the supported Discord versions when you open it.
- **iOS:** the `.ipa` or `.deb` release name tells you which Discord version it matches (for example, `v340.0`).

The JavaScript bundle itself auto-updates from the latest `retribution-bundle` release, but the loader underneath still needs to match Discord.

---

## How do I install it?

The method depends on your device and how much control you want.

### Android, no root
1. Download `retribution-manager-*.apk` from the [manager releases](https://github.com/Retribution-Mod/retribution-manager/releases/latest).
2. Install it, open it, and tap **Install**.
3. The manager downloads Discord, patches it, and installs the patched APK.

### Android, root or LSPosed
1. Download `retribution-xposed` from the [xposed releases](https://github.com/Retribution-Mod/retribution-xposed/releases/latest).
2. Enable the module in your Xposed/LSPosed manager and apply it to Discord.
3. Open Discord. Retribution loads without touching the APK.

### iOS, sideloading
1. Download the `Retribution.ipa` from the [tweak releases](https://github.com/Retribution-Mod/retribution-tweak/releases/latest) that matches your Discord version.
2. Install it with your sideloading tool of choice.
3. Open the sideloaded app. The bundle downloads on first launch.

### iOS, jailbreak or TrollStore
1. Download the correct `.deb`:
   - `iphoneos-arm.deb` for rootful jailbreaks
   - `iphoneos-arm64.deb` for rootless jailbreaks
2. Install it with TrollStore, Filza, Sileo, or Zebra.
3. The tweak injects into the official Discord app.

> **First launch tip:** the bundle downloads on first open. If nothing happens, force-close Discord and reopen it.

---

## How do I install plugins, themes, or fonts?

Three ways.

1. **Inside the app:** open **Retribution Settings** and use the plugin, theme, or font store.
2. **Deep links:** click or type a `retribution://` URL.
   - `retribution://plugin?url=https%3a%2f%2fexample.com%2fplugin.js`
   - `retribution://theme?url=https%3a%2f%2fexample.com%2ftheme.json`
   - `retribution://font?url=https%3a%2f%2fexample.com%2ffont.json`
3. **Manual:** go to **Retribution Settings** > **Plugins**, **Themes**, or **Fonts** and paste a raw URL.

---

## Do plugins from Vendetta / Revenge / Bunny work?

Most of them, yes. Retribution uses the same plugin API. Some plugins may need updates for newer Discord versions or for Retribution-specific features. If a plugin breaks, check with the plugin author first.

---

## Retribution is not loading / settings are missing

Try this in order.

1. Force-close Discord completely, then reopen it.
2. Make sure you have an internet connection for the first bundle download.
3. Check that your Discord version matches the supported version for your Retribution build.
4. On iOS sideloads, make sure the app has network access and is not expired.
5. Clear the JavaScript bundle in **Retribution Settings** > **Developer** > **Clear JS bundle** if that option is available.

---

## Why don't passkeys work?

Passkeys are tied to the app's original signing identity. When the Android manager patches Discord, it resigns the APK. That breaks passkey support.

If you need passkeys, use **retribution-xposed** with root/LSPosed instead. It does not patch or resign the APK, so passkeys keep working.

---

## Why don't I get push notifications on iOS?

Sideloaded apps with a free Apple ID cannot use real push notifications. Apple restricts `aps-environment` to apps signed with a paid developer account or an enterprise/distribution certificate.

If push notifications matter to you, use a service like Signulous that supports distribution signing with push entitlements, and keep the original `com.hammerandchisel.discord` bundle identifier. Jailbreak/TrollStore users generally do not have this limitation.

---

## How do I update Retribution?

It depends on how you installed it.

- **Android manager:** the manager checks for updates on open and prompts you.
- **Android Xposed:** update the `retribution-xposed` APK.
- **iOS sideload:** install the latest matching `Retribution.ipa`.
- **iOS jailbreak/TrollStore:** update the `.deb` package.

The JavaScript bundle updates automatically from the latest `retribution-bundle` release when you restart Discord.

---

## How do I build the bundle myself?

See the [Building guide](./2_building.md).

---

## Where do I get help?

- Bug reports and feature requests: [GitHub issues](https://github.com/Retribution-Mod/Retribution/issues)
- Community support: the Discord server linked in the main README.

---

## Can I recode the manager to be completely unique?

Yes. The manager is a shell around a small set of operations: download Discord, patch resources and smali, sign the APK, and install it. A full rewrite or deep reskin can give it an entirely different look, flow, and architecture. If you want a plan for that, ask.
