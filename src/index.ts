import patchErrorBoundary from "@core/debug/patches/patchErrorBoundary";
import initFixes from "@core/fixes";
import { initFetchI18nStrings } from "@core/i18n";
import initSettings from "@core/ui/settings";
import { initVendettaObject } from "@core/vendetta/api";
import { VdPluginManager } from "@core/vendetta/plugins";
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
            break;
        case "theme":
            await fetchTheme(payload.url, true);
            break;
        case "font":
            await installFont(payload.url, true);
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
        initVendettaObject(),
        initFetchI18nStrings(),
        initSettings(),
        initFixes(),
        patchErrorBoundary(),
        updatePlugins()
    ]).then(
        // Push them all to unloader
        u => u.forEach(f => f && lib.unload.push(f))
    );

    // Assign window object
    window.bunny = lib;

    // Start debugger
    initDebugger();

    // Once done, load Vendetta plugins
    try {
        lib.unload.push(await VdPluginManager.initPlugins());
        await handlePendingDeepLink();
    } catch (e) {
        logger.error("Failed to initialize Vendetta plugins or handle deep link", e);
    }

    // And then, load Bunny plugins
    initPlugins();

    // Update the fonts
    updateFonts();

    // We good :)
    logger.log("Retribution is ready!");
};
