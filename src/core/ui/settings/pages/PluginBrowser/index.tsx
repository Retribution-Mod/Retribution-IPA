import { VdPluginManager } from "@core/vd-compat/plugins";
import { useProxy } from "@core/vd-compat/storage";
import { createStorage, useObservable } from "@lib/api/storage";
import { findAssetId } from "@lib/api/assets";
import { dismissAlert, openAlert } from "@lib/ui/alerts";
import { AlertActionButton } from "@lib/ui/components/wrappers";
import { hideSheet, showSheet } from "@lib/ui/sheets";
import { showToast } from "@lib/ui/toasts";
import isValidHttpUrl from "@lib/utils/isValidHttpUrl";
import safeFetch from "@lib/utils/safeFetch";
import { clipboard, NavigationNative } from "@metro/common";
import { ActionSheet, AlertActions, AlertModal, Button, Card, FlashList, IconButton, Stack, TableRow, TableRowGroup, Text, TextInput } from "@metro/common/components";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

const queryClient = new QueryClient();

interface GithubRepoEntry {
    url: string;
    pagesUrl: string;
    name: string;
}

const githubRepos = createStorage<Record<string, GithubRepoEntry>>("plugins/github-repos.json");

interface RepoPlugin {
    name: string;
    description?: string;
    authors?: string[];
    installUrl: string;
    sourceRepo: string;
    version?: string;
}

function parseGithubUrl(url: string): { user: string; repo: string } | null {
    const match = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\/|$)/i);
    if (!match) return null;
    let repo = match[2];
    if (repo.endsWith(".git")) repo = repo.slice(0, -4);
    return { user: match[1], repo };
}

function parseGithubPagesUrl(url: string): { user: string; repo: string } | null {
    const match = url.match(/^https?:\/\/([^/]+)\.github\.io\/([^/]+?)\//i);
    if (!match) return null;
    return { user: match[1], repo: match[2] };
}

function derivePagesUrl(user: string, repo: string): string {
    return `https://${user}.github.io/${repo}/`;
}

async function enumerateRepoPlugins(repoUrl: string, pagesUrl: string): Promise<RepoPlugin[]> {
    const parsed = parseGithubUrl(repoUrl) ?? parseGithubPagesUrl(repoUrl);
    if (!parsed) throw new Error(`Could not parse GitHub URL: ${repoUrl}`);

    const { user, repo } = parsed;

    // Try to list plugins/ directory via GitHub API
    let pluginDirs: { name: string }[] = [];
    try {
        const resp = await safeFetch(`https://api.github.com/repos/${user}/${repo}/contents/plugins`);
        if (!resp.ok) throw new Error(`GitHub API returned ${resp.status}`);
        const contents = await resp.json() as Array<{ name: string; type: string }>;
        pluginDirs = contents.filter(c => c.type === "dir").map(c => ({ name: c.name }));
    } catch {
        // If plugins/ doesn't exist, check if root is a single plugin
        try {
            const manifestResp = await safeFetch(`${pagesUrl}manifest.json`);
            if (manifestResp.ok) {
                const manifest = await manifestResp.json();
                return [{
                    name: manifest.name ?? repo,
                    description: manifest.description,
                    authors: manifest.authors?.map((a: any) => a.name),
                    installUrl: pagesUrl,
                    sourceRepo: `${user}/${repo}`,
                    version: manifest.version,
                }];
            }
        } catch { }
        throw new Error(`Could not enumerate plugins in ${user}/${repo}. Make sure the repo has a plugins/ directory and GitHub Pages is enabled.`);
    }

    // Fetch manifests for each plugin in parallel
    const results = await Promise.allSettled(
        pluginDirs.map(async (dir) => {
            const installUrl = `${pagesUrl}${dir.name}/`;
            const manifestResp = await safeFetch(`${installUrl}manifest.json`);
            if (!manifestResp.ok) throw new Error(`Failed to fetch manifest for ${dir.name}`);
            const manifest = await manifestResp.json();
            return {
                name: manifest.name ?? dir.name,
                description: manifest.description,
                authors: manifest.authors?.map((a: any) => a.name),
                installUrl,
                sourceRepo: `${user}/${repo}`,
                version: manifest.version,
            } as RepoPlugin;
        })
    );

    return results
        .filter((r): r is PromiseFulfilledResult<RepoPlugin> => r.status === "fulfilled")
        .map(r => r.value);
}

function InstallButton(props: { installUrl: string; name: string; }) {
    useProxy(VdPluginManager.plugins);
    const installUrl = props.installUrl.endsWith("/") ? props.installUrl : props.installUrl + "/";
    const installed = installUrl in VdPluginManager.plugins;
    const [pending, setPending] = useState(false);

    return <Button
        size="sm"
        loading={pending}
        text={!installed ? "Install" : "Uninstall"}
        onPress={async () => {
            setPending(true);
            try {
                if (!installed) {
                    await VdPluginManager.installPlugin(installUrl, true);
                    showToast(`Installed ${props.name}`, findAssetId("CheckmarkSmallIcon")!);
                } else {
                    await VdPluginManager.removePlugin(installUrl);
                    showToast(`Removed ${props.name}`, findAssetId("TrashIcon")!);
                }
            } catch (e) {
                showToast(e instanceof Error ? e.message : String(e), findAssetId("XSmallIcon")!);
            } finally {
                setPending(false);
            }
        }}
        variant={!installed ? "primary" : "destructive"}
        icon={findAssetId(!installed ? "DownloadIcon" : "TrashIcon")}
    />;
}

function PluginCard(props: { plugin: RepoPlugin; }) {
    const { plugin } = props;

    return (
        <Card>
            <Stack spacing={16}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexShrink: 1 }}>
                        <Text numberOfLines={1} variant="heading-lg/semibold">
                            {plugin.name}
                        </Text>
                        <Text variant="text-md/semibold" color="text-muted">
                            by {plugin.authors?.join(", ") || "Unknown"}
                            {plugin.version ? ` (${plugin.version})` : ""}
                        </Text>
                        <Text variant="text-xs/medium" color="text-muted">
                            from {plugin.sourceRepo}
                        </Text>
                    </View>
                    <View>
                        <InstallButton installUrl={plugin.installUrl} name={plugin.name} />
                    </View>
                </View>
                {plugin.description && (
                    <Text variant="text-md/medium">
                        {plugin.description}
                    </Text>
                )}
            </Stack>
        </Card>
    );
}

function BrowserPage() {
    const navigation = NavigationNative.useNavigation();
    const [search, setSearch] = useState("");

    useObservable([githubRepos]);
    useProxy(VdPluginManager.plugins);

    const repoKeys = Object.keys(githubRepos);

    useEffect(() => {
        navigation.setOptions({
            title: "Plugin Repos",
            headerRight: () => <IconButton
                size="sm"
                variant="secondary"
                icon={findAssetId("MoreHorizontalIcon")}
                onPress={() => {
                    showSheet("plugin-repo-management", RepoManagementSheet);
                }}
            />
        });
    }, [navigation]);

    const { data, error, isPending, refetch } = useQuery({
        queryKey: ["github-repo-plugins", repoKeys.join(",")],
        queryFn: async () => {
            const repos = Object.values(githubRepos);
            if (repos.length === 0) return [] as RepoPlugin[];
            const results = await Promise.allSettled(
                repos.map(r => enumerateRepoPlugins(r.url, r.pagesUrl))
            );
            return results
                .filter((r): r is PromiseFulfilledResult<RepoPlugin[]> => r.status === "fulfilled")
                .flatMap(r => r.value);
        }
    });

    const filteredData = useMemo(() => {
        if (!data) return [];
        if (!search) return data;
        const lower = search.toLowerCase();
        return data.filter(p =>
            p.name.toLowerCase().includes(lower) ||
            p.description?.toLowerCase().includes(lower) ||
            p.authors?.some(a => a.toLowerCase().includes(lower)) ||
            p.sourceRepo.toLowerCase().includes(lower)
        );
    }, [data, search]);

    if (repoKeys.length === 0) {
        return <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 16 }}>
            <Card style={{ gap: 8 }}>
                <Text style={{ textAlign: "center" }} variant="heading-lg/bold">
                    No Repositories Added
                </Text>
                <Text style={{ textAlign: "center" }} variant="text-sm/medium" color="text-muted">
                    Add a GitHub or Vendetta plugin repository to browse and install plugins.
                </Text>
                <Button
                    size="lg"
                    text="Add Repository"
                    onPress={() => showSheet("plugin-repo-management", RepoManagementSheet)}
                    icon={findAssetId("PlusMediumIcon")}
                />
            </Card>
        </View>;
    }

    if (error && !data) {
        return <View style={{ flex: 1, paddingHorizontal: 8, justifyContent: "center", alignItems: "center" }}>
            <Card style={{ gap: 8 }}>
                <Text style={{ textAlign: "center" }} variant="heading-lg/bold">
                    An error occurred while fetching plugins!
                </Text>
                <Text style={{ textAlign: "center" }} variant="text-sm/medium" color="text-muted">
                    {error instanceof Error ? error.message : String(error)}
                </Text>
                <Button
                    size="lg"
                    text="Refetch"
                    onPress={refetch}
                    icon={findAssetId("RetryIcon")}
                />
            </Card>
        </View>;
    }

    if (isPending && !data) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text variant="heading-md/medium" color="text-muted">
                    Loading plugins...
                </Text>
            </View>
        );
    }

    return <FlashList
        data={filteredData}
        refreshing={isPending}
        onRefresh={refetch}
        estimatedItemSize={136}
        contentContainerStyle={{ paddingBottom: 90, paddingHorizontal: 5 }}
        ListHeaderComponent={() => (
            <View style={{ paddingVertical: 8, paddingHorizontal: 8 }}>
                <TextInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search plugins..."
                />
            </View>
        )}
        ListEmptyComponent={() => (
            <View style={{ padding: 16, alignItems: "center" }}>
                <Text variant="heading-md/medium" style={{ textAlign: "center" }}>
                    {search ? "No plugins match your search." : "No plugins found. Try adding a repository."}
                </Text>
            </View>
        )}
        renderItem={({ item: plugin }: any) => (
            <View style={{ paddingVertical: 6, paddingHorizontal: 8 }}>
                <PluginCard plugin={plugin} />
            </View>
        )}
    />;
}

function AddRepositoryAlert() {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    const [adding, setAdding] = useState(false);

    return <AlertModal
        title="Add Repository"
        content="Enter the GitHub URL of the plugin repository you want to add."
        extraContent={<Stack spacing={8}>
            <TextInput
                value={value}
                onChange={(v: string) => { setValue(v); setError(""); }}
                placeholder="https://github.com/user/repo"
                state={error ? "error" : undefined}
                errorMessage={error || undefined}
            />
            <Text variant="text-xs/medium" color="text-muted">
                Supports GitHub repos with a plugins/ directory and GitHub Pages enabled.
            </Text>
        </Stack>}
        actions={<AlertActions>
            <AlertActionButton
                text="Add"
                variant="primary"
                disabled={!isValidHttpUrl(value) || adding}
                onPress={async () => {
                    setAdding(true);
                    setError("");
                    try {
                        const parsed = parseGithubUrl(value) ?? parseGithubPagesUrl(value);
                        if (!parsed) {
                            throw new Error("Please enter a valid GitHub repository URL");
                        }
                        const { user, repo } = parsed;
                        const pagesUrl = derivePagesUrl(user, repo);

                        // Verify the repo has plugins by trying to enumerate
                        const plugins = await enumerateRepoPlugins(value, pagesUrl);
                        if (plugins.length === 0) {
                            throw new Error("No plugins found in this repository");
                        }

                        githubRepos[value] = {
                            url: value,
                            pagesUrl,
                            name: `${user}/${repo}`,
                        };

                        showToast(`Added repository with ${plugins.length} plugins!`, findAssetId("CheckmarkSmallIcon")!);
                        dismissAlert("bunny-add-github-repo");
                    } catch (e) {
                        setError(e instanceof Error ? e.message : String(e));
                    } finally {
                        setAdding(false);
                    }
                }} />
        </AlertActions>} />;
}

function RepoManagementSheet() {
    useObservable([githubRepos]);
    const repoEntries = Object.entries(githubRepos);

    return <ActionSheet>
        <TableRowGroup title="Repositories">
            {repoEntries.length === 0 && (
                <TableRow
                    label="No repositories added"
                    subLabel="Tap 'Add Repository' to get started"
                />
            )}
            {repoEntries.map(([key, repo]) => {
                return <TableRow
                    key={key}
                    label={repo.name}
                    subLabel={repo.url}
                    trailing={(
                        <Stack direction="horizontal">
                            <IconButton
                                size="sm"
                                variant="secondary"
                                icon={findAssetId("LinkIcon")}
                                onPress={() => {
                                    clipboard.setString(repo.url);
                                    showToast.showCopyToClipboard();
                                }}
                            />
                            <IconButton
                                size="sm"
                                variant="destructive"
                                icon={findAssetId("TrashIcon")}
                                onPress={() => {
                                    openAlert("bunny-remove-github-repo", <AlertModal
                                        title="Remove Repository"
                                        content="Are you sure you want to remove this repository?"
                                        extraContent={<Card>
                                            <Text variant="text-md/normal">{repo.url}</Text>
                                        </Card>}
                                        actions={<AlertActions>
                                            <AlertActionButton
                                                text="Remove"
                                                variant="destructive"
                                                onPress={() => {
                                                    delete githubRepos[key];
                                                    showToast("Removed repository!", findAssetId("TrashIcon")!);
                                                    dismissAlert("bunny-remove-github-repo");
                                                }}
                                            />
                                        </AlertActions>}
                                    />);
                                }}
                            />
                        </Stack>
                    )} />
            })}
            <TableRow
                label="Add Repository..."
                icon={<TableRow.Icon source={findAssetId("PlusMediumIcon")} />}
                onPress={() => {
                    openAlert("bunny-add-github-repo", <AddRepositoryAlert />);
                    hideSheet("plugin-repo-management");
                }} />
        </TableRowGroup>
    </ActionSheet>;
}

export default function PluginBrowser() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserPage />
        </QueryClientProvider>
    );
}
