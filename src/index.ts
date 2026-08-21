import patchErrorBoundary from "@core/debug/patches/patchErrorBoundary";
import initFixes from "@core/fixes";
import { initFetchI18nStrings } from "@core/i18n";
import initSettings from "@core/ui/settings";
import { initRetributionObject } from "@core/vd-compat/api";
import { VdPluginManager } from "@core/vd-compat/plugins";
import { installFont, updateFonts } from "@lib/addons/fonts";
import { initPlugins, updatePlugins } from "@lib/addons/plugins";
import { fetchTheme, initThemes } from "@lib/addons/themes";
import { patchCommands } from "@lib/api/commands";
import { initDebugger } from "@lib/api/debug";
import { injectFluxInterceptor } from "@lib/api/flux";
import { fileExists, readFile, removeFile } from "@lib/api/native/fs";
import { patchJsx } from "@lib/api/react/jsx";
import { logger } from "@lib/utils/logger";
import { patchSettings } from "@ui/settings";
import { showToast } from "@lib/ui/toasts";
import { findAssetId } from "@lib/api/assets";

import * as lib from "./lib";

type DeepLinkPayload = {
    type: "plugin" | "theme" | "font";
    url: string;
};

async function handlePendingDeepLink() {
    if (!await fileExists("deeplink.json")) return;

    const payload = JSON.parse(await readFile("deeplink.json")) as DeepLinkPayload;
    await removeFile("deeplink.json");

    if (typeof payload.url !== "string") throw new Error("Invalid deep link URL");

    switch (payload.type) {
        case "plugin":
            await VdPluginManager.installPlugin(payload.url);
            showToast(`Installed plugin from ${payload.url}`, findAssetId("CheckmarkSmallIcon")!);
            break;
        case "theme":
            await fetchTheme(payload.url, true);
            showToast("Theme applied", findAssetId("CheckmarkSmallIcon")!);
            break;
        case "font":
            await installFont(payload.url, true);
            showToast("Font applied", findAssetId("CheckmarkSmallIcon")!);
            break;
        default:
            throw new Error("Invalid deep link type");
    }
}

export default async () => {
    // Load everything in parallel
    await Promise.all([
        initThemes(),
        injectFluxInterceptor(),
        patchSettings(),
        patchCommands(),
        patchJsx(),
        initRetributionObject(),
        initFetchI18nStrings(),
        initSettings(),
        initFixes(),
        patchErrorBoundary(),
        updatePlugins()
    ]).then(
        // Push them all to unloader
        u => u.forEach(f => f && lib.unload.push(f))
    );

    // Assign window objects
    // window.bunny is kept for Bunny-spec plugins; window.retribution is the unified API
    window.bunny = lib;

    // Start debugger
    initDebugger();

    // Once done, load Retribution plugins (polymanifest format)
    try {
        lib.unload.push(await VdPluginManager.initPlugins());
        await handlePendingDeepLink();
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        logger.error("Failed to initialize plugins or handle deep link", e);
        showToast(`Deep link failed: ${message}`, findAssetId("XSmallIcon")!);
    }

    // And then, load Bunny-spec plugins
    initPlugins();

    // Update the fonts
    updateFonts();

    // We good :)
    logger.log("Retribution is ready!");
};
