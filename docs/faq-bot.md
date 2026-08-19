# Retribution Bot Notes / Tags

Predefined bot responses. Each heading is the tag/command name. Bot users call these with a prefix like `!note <tag>`.

---

## install

**⬇️ How to install Retribution?**

Pick your platform and follow the matching guide:

- **Android (no root):** use [Retribution Manager](https://github.com/Retribution-Mod/retribution-manager/releases/latest).
- **Android (root/LSPosed):** use [RetributionXposed](https://github.com/Retribution-Mod/retribution-xposed/releases/latest).
- **iOS (sideload):** grab the `Retribution.ipa` from [retribution-tweak releases](https://github.com/Retribution-Mod/retribution-tweak/releases/latest).
- **iOS (jailbreak/TrollStore):** install the matching `.deb`.

---

## passkeys

**🔑 Passkeys do not work**

Passkeys are broken on the Android manager because it patches and resigns the Discord APK.

Use **RetributionXposed** with root/LSPosed instead. It does not patch the APK, so passkeys keep working.

---

## outdated

**⚠️ Discord client too outdated**

Retribution only supports specific Discord versions. The manager and tweak releases tell you which version they target.

Use a supported Discord version, or wait for a Retribution release that matches the version you want.

---

## what

**👊 What is Retribution?**

Retribution is a client mod for Discord on Android and iOS. It loads plugins, themes, and fonts inside the official Discord app.

It is a continuation of Bunny, built on the same loader ideas as Vendetta and Pyoncord.

---

## safe

**🛡️ Is Retribution safe?**

It is open source, but it is not official or endorsed by Discord. Using it may violate Discord's Terms of Service.

Use it because you accept that risk, not because you think it is invisible.

---

## plugins

**🔌 Can I use Revenge / Vendetta / Bunny plugins?**

Most plugins built for the Vendetta/Bunny/Revenge API will work. Some may need updates for newer Discord versions or Retribution-specific features.

---

## themes

**🎨 How do I install themes or fonts?**

Three ways:
1. In-app: **Retribution Settings** > **Themes** or **Fonts**
2. Deep link: `retribution://theme?url=URL` or `retribution://font?url=URL`
3. Manual: paste a raw theme/font URL in the settings page

---

## not-loading

**🔄 Retribution isn't loading**

Try in this order:
1. Force-close Discord and reopen it.
2. Check your internet connection.
3. Make sure your Discord version matches the supported version.
4. On iOS sideloads, check the app is not expired and has network access.
5. Clear the JS bundle in **Retribution Settings** > **Developer** > **Clear JS bundle**.

---

## notifications

**🔔 Why don't I get push notifications on iOS?**

Free-Apple-ID sideloads cannot use real push notifications. Apple restricts push to apps signed with proper distribution certificates.

Use a paid signing service that supports push, or jailbreak/TrollStore if your setup allows it.

---

## update

**🔄 How do I update Retribution?**

- **Android manager:** the manager prompts you when it opens.
- **Android Xposed:** update the `retribution-xposed` APK.
- **iOS sideload:** install the latest matching `Retribution.ipa`.
- **iOS jailbreak/TrollStore:** update the `.deb`.

The JS bundle updates automatically when you restart Discord.

---

## build

**🛠️ How do I build the bundle?**

See the [Building guide](https://github.com/Retribution-Mod/Retribution/blob/main/docs/2_building.md).

---

## help

**📢 Where do I get help?**

Bug reports and feature requests: [GitHub Issues](https://github.com/Retribution-Mod/Retribution/issues)
Community support: the Discord server linked in the README.

---

## quicklinks

**🔗 Useful links**

- [Retribution bundle releases](https://github.com/Retribution-Mod/Retribution/releases/latest)
- [Retribution Manager releases](https://github.com/Retribution-Mod/retribution-manager/releases/latest)
- [RetributionXposed releases](https://github.com/Retribution-Mod/retribution-xposed/releases/latest)
- [retribution-tweak releases](https://github.com/Retribution-Mod/retribution-tweak/releases/latest)
