import DataBrowser from "@core/ui/components/DataBrowser";
import { VdPluginManager } from "@core/vd-compat/plugins";
import pluginsData from "@assets/data/plugins-data.json";
import safeFetch from "@lib/utils/safeFetch";
import { useEffect, useState } from "react";

interface PluginDataItem {
    name: string;
    description?: string;
    authors?: string[];
    status?: string;
    sourceUrl?: string;
    installUrl: string;
    warningMessage?: string;
    hidden?: boolean;
}

const PUBLIC_PLUGINS_URL = "https://retribution.is-your.app/data/plugins-data.json";

export default function PluginDataBrowser() {
    const [items, setItems] = useState<PluginDataItem[]>(pluginsData as unknown as PluginDataItem[]);

    useEffect(() => {
        safeFetch(PUBLIC_PLUGINS_URL, { method: "GET" })
            .then(async (r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const data = await r.json();
                if (!Array.isArray(data) || data.length === 0) return;
                setItems(data.filter((i: PluginDataItem) => !i.hidden) as PluginDataItem[]);
            })
            .catch(() => {
                // Fall back to bundled data
            });
    }, []);

    return (
        <DataBrowser<PluginDataItem>
            title="Plugin Browser"
            items={items}
            onInstall={async (item) => {
                let url = item.installUrl;
                if (!url.endsWith("/")) url += "/";
                await VdPluginManager.installPlugin(url, true);
            }}
            searchKeys={[
                "name",
                "description",
                (obj) => obj.authors?.join(" ") ?? "",
            ]}
            sortOptions={{
                "Name (A-Z)": (a, b) => a.name.localeCompare(b.name),
                "Name (Z-A)": (a, b) => b.name.localeCompare(a.name),
            }}
            installAction={{
                label: "Install a plugin",
                fetchFn: (url) => VdPluginManager.installPlugin(url, true),
            }}
        />
    );
}
