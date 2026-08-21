import DataBrowser from "@core/ui/components/DataBrowser";
import { VdPluginManager } from "@core/vd-compat/plugins";
import pluginsData from "@assets/data/plugins-data.json";
import { findAssetId } from "@lib/api/assets";

interface PluginDataItem {
    name: string;
    description?: string;
    authors?: string[];
    status?: string;
    sourceUrl?: string;
    installUrl: string;
    warningMessage?: string;
}

export default function PluginDataBrowser() {
    return (
        <DataBrowser<PluginDataItem>
            title="Plugin Browser"
            items={pluginsData as PluginDataItem[]}
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
