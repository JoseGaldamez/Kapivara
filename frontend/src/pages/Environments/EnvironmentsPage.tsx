import { useState, useEffect, useMemo } from "react";
import { ProjectPageHeader } from "@/components/common/ProjectPageHeader";
import {
    Plus,
    Trash2,
    Save,
    Globe,
    FolderKanban,
    Layers,
    Database,
    ToggleLeft,
    ToggleRight,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import { Environment, EnvironmentScope, EnvironmentVariable, Project } from "@/types";
import { useEnvironmentStore } from "@/stores/environment.store";
import { environmentController } from "@/controllers/environment.controller";
import { toast } from "react-toastify";

interface EnvironmentsPageProps {
    project: Project;
    onNavigateToRequests: () => void;
    initialTab?: "editor" | "resolved";
}

const EMPTY_ENVIRONMENTS: Environment[] = [];

const EMPTY_ROW = (): EnvironmentVariable => ({
    id: crypto.randomUUID(),
    key: "",
    value: "",
    enabled: 1,
});

const parseVariables = (environment: Environment | undefined): EnvironmentVariable[] => {
    if (!environment?.variables) return [EMPTY_ROW()];
    try {
        const parsed = JSON.parse(environment.variables);
        if (!Array.isArray(parsed) || parsed.length === 0) return [EMPTY_ROW()];

        const normalized: EnvironmentVariable[] = parsed.map((item) => ({
            id: item.id || crypto.randomUUID(),
            key: item.key || "",
            value: item.value || "",
            enabled: item.enabled === 0 ? 0 : 1,
        }));

        const last = normalized[normalized.length - 1];
        if (last.key || last.value) {
            normalized.push(EMPTY_ROW());
        }
        return normalized;
    } catch {
        return [EMPTY_ROW()];
    }
};

export const EnvironmentsPage = ({
    project,
    onNavigateToRequests,
    initialTab = "editor",
}: EnvironmentsPageProps) => {
    const projectId = project.uid;
    const projectEnvironments = useEnvironmentStore(
        (state) => state.projectEnvironmentsByProject[projectId] ?? EMPTY_ENVIRONMENTS
    );
    const globalEnvironments = useEnvironmentStore(
        (state) => state.globalEnvironments ?? EMPTY_ENVIRONMENTS
    );
    const activeProjectEnvId = useEnvironmentStore(
        (state) => state.activeProjectEnvironmentIdByProject[projectId] ?? null
    );
    const activeGlobalEnvId = useEnvironmentStore(
        (state) => state.activeGlobalEnvironmentId ?? null
    );

    const [activeTab, setActiveTab] = useState<"editor" | "resolved">(initialTab);
    const [selectedEnv, setSelectedEnv] = useState<{ id: string; scope: EnvironmentScope } | null>(null);
    const [envName, setEnvName] = useState("");
    const [variables, setVariables] = useState<EnvironmentVariable[]>([EMPTY_ROW()]);
    const [newEnvName, setNewEnvName] = useState("");
    const [newEnvScope, setNewEnvScope] = useState<EnvironmentScope>("project");
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [resolvedVariables, setResolvedVariables] = useState<Record<string, string>>({});
    const [isSavingVars, setIsSavingVars] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [envToDelete, setEnvToDelete] = useState<{ id: string; name: string; scope: EnvironmentScope } | null>(null);

    // Active editing environment details
    const activeEditingEnv = useMemo(() => {
        if (!selectedEnv) return null;
        const list = selectedEnv.scope === "project" ? projectEnvironments : globalEnvironments;
        return list.find((e) => e.id === selectedEnv.id) || null;
    }, [selectedEnv, projectEnvironments, globalEnvironments]);

    // Bootstrap data
    useEffect(() => {
        const init = async () => {
            await environmentController.bootstrap(projectId);
            const resolved = await environmentController.getResolvedVariables(projectId);
            setResolvedVariables(resolved);

            if (!selectedEnv) {
                if (projectEnvironments.length > 0) {
                    setSelectedEnv({ id: projectEnvironments[0].id, scope: "project" });
                } else if (globalEnvironments.length > 0) {
                    setSelectedEnv({ id: globalEnvironments[0].id, scope: "global" });
                }
            }
        };
        void init();
    }, [projectId]);

    // Sync form state when selection changes
    useEffect(() => {
        if (activeEditingEnv) {
            setEnvName(activeEditingEnv.name);
            setVariables(parseVariables(activeEditingEnv));
        } else {
            setEnvName("");
            setVariables([EMPTY_ROW()]);
        }
    }, [activeEditingEnv?.id]);

    const refreshDashboard = async () => {
        setIsRefreshing(true);
        try {
            const resolved = await environmentController.getResolvedVariables(projectId);
            setResolvedVariables(resolved);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleCreateEnvironment = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanName = newEnvName.trim();
        if (!cleanName) {
            toast.warning("Environment name is required");
            return;
        }

        try {
            const created = await environmentController.createEnvironment(
                newEnvScope,
                cleanName,
                newEnvScope === "project" ? projectId : undefined
            );
            setNewEnvName("");
            setIsCreatingNew(false);
            await refreshDashboard();
            setSelectedEnv({ id: created.id, scope: newEnvScope });
            toast.success(`Environment '${cleanName}' created`);
        } catch {
            toast.error("Failed to create environment");
        }
    };

    const handleRenameEnvironment = async () => {
        if (!activeEditingEnv || !selectedEnv) return;
        const cleanName = envName.trim();
        if (!cleanName) {
            toast.warning("Name cannot be empty");
            return;
        }

        try {
            await environmentController.renameEnvironment(
                selectedEnv.scope,
                activeEditingEnv.id,
                cleanName,
                selectedEnv.scope === "project" ? projectId : undefined
            );
            await refreshDashboard();
            toast.success("Environment renamed");
        } catch {
            toast.error("Failed to rename environment");
        }
    };

    const handleConfirmDelete = async () => {
        if (!envToDelete) return;
        try {
            await environmentController.deleteEnvironment(
                envToDelete.scope,
                envToDelete.id,
                envToDelete.scope === "project" ? projectId : undefined
            );
            await refreshDashboard();
            if (selectedEnv?.id === envToDelete.id) {
                setSelectedEnv(null);
            }
            toast.success(`Environment '${envToDelete.name}' deleted`);
            setEnvToDelete(null);

            if (projectEnvironments.length > 1) {
                const next = projectEnvironments.find((e) => e.id !== envToDelete.id);
                if (next) setSelectedEnv({ id: next.id, scope: "project" });
            } else if (globalEnvironments.length > 0) {
                setSelectedEnv({ id: globalEnvironments[0].id, scope: "global" });
            }
        } catch {
            toast.error("Failed to delete environment");
        }
    };

    const handleSaveVariables = async () => {
        if (!activeEditingEnv || !selectedEnv) return;

        setIsSavingVars(true);
        const finalVariables = variables
            .filter((row) => row.key.trim() !== "")
            .map((row) => ({
                ...row,
                key: row.key.trim(),
                value: row.value || "",
                enabled: row.enabled === 0 ? 0 : 1,
            }));

        try {
            await environmentController.updateEnvironmentVariables(
                selectedEnv.scope,
                activeEditingEnv.id,
                finalVariables,
                selectedEnv.scope === "project" ? projectId : undefined
            );
            await refreshDashboard();
            toast.success("Environment variables saved");
        } catch {
            toast.error("Failed to save variables");
        } finally {
            setIsSavingVars(false);
        }
    };

    const updateVariableField = (id: string, field: keyof EnvironmentVariable, value: any) => {
        const next = variables.map((row) => (row.id === id ? { ...row, [field]: value } : row));
        const last = next[next.length - 1];
        if (last.key || last.value) {
            next.push(EMPTY_ROW());
        }
        setVariables(next);
    };

    const removeVariableRow = (id: string) => {
        if (variables.length <= 1) {
            setVariables([EMPTY_ROW()]);
            return;
        }
        setVariables(variables.filter((row) => row.id !== id));
    };

    const toggleProjectEnvActive = async (envId: string) => {
        const nextActive = activeProjectEnvId === envId ? null : envId;
        await environmentController.setActiveEnvironment("project", nextActive, projectId);
        await refreshDashboard();
    };

    const toggleGlobalEnvActive = async (envId: string) => {
        const nextActive = activeGlobalEnvId === envId ? null : envId;
        await environmentController.setActiveEnvironment("global", nextActive);
        await refreshDashboard();
    };

    // Diagnostics for resolved variables
    const activeProjectEnv = projectEnvironments.find((e) => e.id === activeProjectEnvId);
    const activeGlobalEnv = globalEnvironments.find((e) => e.id === activeGlobalEnvId);

    const projectEnvVars = useMemo(() => {
        return parseVariables(activeProjectEnv).filter((v) => v.enabled && v.key.trim() !== "");
    }, [activeProjectEnv]);

    const globalEnvVars = useMemo(() => {
        return parseVariables(activeGlobalEnv).filter((v) => v.enabled && v.key.trim() !== "");
    }, [activeGlobalEnv]);

    const viewTabsAction = (
        <div className="inline-flex rounded-lg border border-[#ded7ce] bg-[#eae2d7] p-1 dark:border-white/10 dark:bg-[#1c1d23]">
            <button
                type="button"
                onClick={() => setActiveTab("editor")}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    activeTab === "editor"
                        ? "bg-white text-[#2c211c] shadow-xs dark:bg-[#282a32] dark:text-[#f8eee5]"
                        : "text-[#7e695d] hover:text-[#2c211c] dark:text-[#9c958f] dark:hover:text-[#f8eee5]"
                }`}
            >
                <Database size={14} /> Environments Manager
            </button>
            <button
                type="button"
                onClick={() => {
                    setActiveTab("resolved");
                    void refreshDashboard();
                }}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    activeTab === "resolved"
                        ? "bg-white text-[#2c211c] shadow-xs dark:bg-[#282a32] dark:text-[#f8eee5]"
                        : "text-[#7e695d] hover:text-[#2c211c] dark:text-[#9c958f] dark:hover:text-[#f8eee5]"
                }`}
            >
                <Layers size={14} /> Resolved Active Context
            </button>
        </div>
    );

    return (
        <main className="h-full overflow-y-auto overscroll-contain bg-[#f4eadf] text-[#2c211c] transition-colors dark:bg-[#101115] dark:text-[#f8eee5]">
            <div className="mx-auto w-full max-w-[1120px] px-6 py-7 lg:px-10 lg:py-8">
                <ProjectPageHeader
                    title="Environments & Variables"
                    description="Manage project and global variable sets for"
                    projectName={project.name}
                    icon={Database}
                    onNavigateToRequests={onNavigateToRequests}
                    actions={viewTabsAction}
                />

                {/* TAB 1: ENVIRONMENTS & VARIABLES EDITOR */}
                {activeTab === "editor" && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
                        {/* Left Sidebar: Environment Selector */}
                        <div className="flex flex-col gap-5 rounded-xl border border-[#ded7ce] bg-[#fffdf9] p-4 shadow-[0_6px_20px_rgba(62,47,37,0.04)] dark:border-white/8 dark:bg-[#18191e]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#7e695d] dark:text-[#9c958f]">
                                    Environments
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingNew(!isCreatingNew)}
                                    className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#245f92] transition-colors hover:underline dark:text-blue-400"
                                >
                                    <Plus size={14} /> New
                                </button>
                            </div>

                            {/* Inline New Environment Form */}
                            {isCreatingNew && (
                                <form
                                    onSubmit={handleCreateEnvironment}
                                    className="rounded-lg border border-[#e5ddd3] bg-[#faf6f0] p-3 dark:border-white/10 dark:bg-[#202127]"
                                >
                                    <div className="text-xs font-semibold text-[#4e3c32] dark:text-[#d8cfc7]">
                                        Create New Environment
                                    </div>
                                    <input
                                        type="text"
                                        value={newEnvName}
                                        onChange={(e) => setNewEnvName(e.target.value)}
                                        placeholder="e.g. Staging, Production"
                                        autoFocus
                                        className="mt-2 h-8 w-full rounded-md border border-[#d5ccc1] bg-white px-2.5 text-xs text-[#2c211c] placeholder:text-[#a5998f] focus:border-[#245f92] focus:outline-none dark:border-white/10 dark:bg-[#17181d] dark:text-[#f8eee5]"
                                    />
                                    <div className="mt-2.5 flex items-center justify-between text-xs">
                                        <select
                                            value={newEnvScope}
                                            onChange={(e) => setNewEnvScope(e.target.value as EnvironmentScope)}
                                            className="h-7 rounded border border-[#d5ccc1] bg-white px-2 text-[11px] text-[#4e3c32] dark:border-white/10 dark:bg-[#17181d] dark:text-[#d8cfc7]"
                                        >
                                            <option value="project">Project Scope</option>
                                            <option value="global">Global Scope</option>
                                        </select>
                                        <div className="flex gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setIsCreatingNew(false)}
                                                className="cursor-pointer rounded px-2 py-1 text-[11px] text-[#7e695d] hover:bg-[#ede5dc] dark:text-[#a09a94] dark:hover:bg-white/6"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="cursor-pointer rounded bg-[#245f92] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#1d527f]"
                                            >
                                                Create
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* Section: Project Environments */}
                            <div>
                                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-[#8f796c] dark:text-[#8f8b86]">
                                    <FolderKanban size={13} /> Project Environments
                                </div>
                                <div className="space-y-1">
                                    {projectEnvironments.length === 0 ? (
                                        <div className="py-2 text-[11px] italic text-[#a39488] dark:text-[#6a6662]">
                                            No project environments yet.
                                        </div>
                                    ) : (
                                        projectEnvironments.map((env) => {
                                            const isSelected = selectedEnv?.id === env.id;
                                            const isActive = activeProjectEnvId === env.id;
                                            return (
                                                <div
                                                    key={env.id}
                                                    onClick={() => setSelectedEnv({ id: env.id, scope: "project" })}
                                                    className={`group flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors ${
                                                        isSelected
                                                            ? "bg-[#245f92] font-semibold text-white shadow-xs"
                                                            : "text-[#3d2a21] hover:bg-[#f3ece4] dark:text-[#e4dad3] dark:hover:bg-white/6"
                                                    }`}
                                                >
                                                    <span className="truncate">{env.name}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            title={isActive ? "Deactivate environment" : "Activate for project"}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                void toggleProjectEnvActive(env.id);
                                                            }}
                                                            className={`cursor-pointer rounded p-0.5 transition-colors ${
                                                                isActive
                                                                    ? isSelected
                                                                        ? "text-emerald-300"
                                                                        : "text-emerald-600 dark:text-emerald-400"
                                                                    : isSelected
                                                                    ? "text-white/50 hover:text-white"
                                                                    : "text-[#aa9a8e] hover:text-[#2c211c] dark:hover:text-white"
                                                            }`}
                                                        >
                                                            {isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Section: Global Environments */}
                            <div className="border-t border-[#eee6df] pt-4 dark:border-white/7">
                                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-[#8f796c] dark:text-[#8f8b86]">
                                    <Globe size={13} /> Global Environments
                                </div>
                                <div className="space-y-1">
                                    {globalEnvironments.length === 0 ? (
                                        <div className="py-2 text-[11px] italic text-[#a39488] dark:text-[#6a6662]">
                                            No global environments yet.
                                        </div>
                                    ) : (
                                        globalEnvironments.map((env) => {
                                            const isSelected = selectedEnv?.id === env.id;
                                            const isActive = activeGlobalEnvId === env.id;
                                            return (
                                                <div
                                                    key={env.id}
                                                    onClick={() => setSelectedEnv({ id: env.id, scope: "global" })}
                                                    className={`group flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors ${
                                                        isSelected
                                                            ? "bg-[#245f92] font-semibold text-white shadow-xs"
                                                            : "text-[#3d2a21] hover:bg-[#f3ece4] dark:text-[#e4dad3] dark:hover:bg-white/6"
                                                    }`}
                                                >
                                                    <span className="truncate">{env.name}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            title={isActive ? "Deactivate global environment" : "Activate globally"}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                void toggleGlobalEnvActive(env.id);
                                                            }}
                                                            className={`cursor-pointer rounded p-0.5 transition-colors ${
                                                                isActive
                                                                    ? isSelected
                                                                        ? "text-emerald-300"
                                                                        : "text-emerald-600 dark:text-emerald-400"
                                                                    : isSelected
                                                                    ? "text-white/50 hover:text-white"
                                                                    : "text-[#aa9a8e] hover:text-[#2c211c] dark:hover:text-white"
                                                            }`}
                                                        >
                                                            {isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Content: Active Environment Variable Table */}
                        {activeEditingEnv && selectedEnv ? (
                            <div className="flex flex-col rounded-xl border border-[#ded7ce] bg-[#fffdf9] p-6 shadow-[0_6px_20px_rgba(62,47,37,0.04)] dark:border-white/8 dark:bg-[#18191e]">
                                {/* Header of editing environment */}
                                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#eee6df] pb-5 dark:border-white/7">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={envName}
                                            onChange={(e) => setEnvName(e.target.value)}
                                            onBlur={handleRenameEnvironment}
                                            title="Click to rename environment"
                                            className="h-9 rounded-lg border border-transparent px-2 text-lg font-bold text-[#2c211c] transition-colors hover:border-[#d5ccc1] focus:border-[#245f92] focus:bg-white focus:outline-none dark:text-[#f8eee5] dark:hover:border-white/10 dark:focus:bg-[#202127]"
                                        />
                                        <span className="inline-flex items-center gap-1 rounded-md bg-[#f1ece5] px-2 py-0.5 text-[10px] font-semibold text-[#6a554a] dark:bg-white/8 dark:text-[#cfc6be]">
                                            {selectedEnv.scope === "project" ? (
                                                <>
                                                    <FolderKanban size={11} /> Project Scope
                                                </>
                                            ) : (
                                                <>
                                                    <Globe size={11} /> Global Scope
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEnvToDelete({
                                                    id: activeEditingEnv.id,
                                                    name: activeEditingEnv.name,
                                                    scope: selectedEnv.scope,
                                                })
                                            }
                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/40"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSaveVariables}
                                            disabled={isSavingVars}
                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#245f92] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#1d527f] disabled:opacity-50"
                                        >
                                            <Save size={14} /> {isSavingVars ? "Saving..." : "Save Variables"}
                                        </button>
                                    </div>
                                </div>

                                {/* Table of variables */}
                                <div className="flex-1 overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-[#eee6df] text-[11px] font-bold uppercase tracking-wider text-[#8f796c] dark:border-white/7 dark:text-[#8f8b86]">
                                                <th className="w-10 pb-2 text-center">Active</th>
                                                <th className="pb-2 pl-3">Variable Name (Key)</th>
                                                <th className="pb-2 pl-3">Value</th>
                                                <th className="w-10 pb-2 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#f2ebe3] dark:divide-white/5">
                                            {variables.map((row) => (
                                                <tr key={row.id} className="group hover:bg-[#faf6f0] dark:hover:bg-white/2">
                                                    <td className="py-2 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={row.enabled === 1}
                                                            onChange={(e) =>
                                                                updateVariableField(row.id, "enabled", e.target.checked ? 1 : 0)
                                                            }
                                                            className="h-4 w-4 cursor-pointer rounded accent-[#245f92]"
                                                        />
                                                    </td>
                                                    <td className="py-1.5 pl-3">
                                                        <input
                                                            type="text"
                                                            value={row.key}
                                                            onChange={(e) =>
                                                                updateVariableField(row.id, "key", e.target.value)
                                                            }
                                                            placeholder="VARIABLE_NAME"
                                                            className="h-8 w-full rounded-md border border-transparent bg-transparent px-2 font-mono text-xs text-[#2c211c] placeholder:font-sans placeholder:text-[#a89c92] hover:border-[#ded6ce] focus:border-[#245f92] focus:bg-white focus:outline-none dark:text-[#f8eee5] dark:placeholder:text-[#6a6661] dark:hover:border-white/10 dark:focus:bg-[#202127]"
                                                        />
                                                    </td>
                                                    <td className="py-1.5 pl-3">
                                                        <input
                                                            type="text"
                                                            value={row.value}
                                                            onChange={(e) =>
                                                                updateVariableField(row.id, "value", e.target.value)
                                                            }
                                                            placeholder="value or secret"
                                                            className="h-8 w-full rounded-md border border-transparent bg-transparent px-2 font-mono text-xs text-[#2c211c] placeholder:font-sans placeholder:text-[#a89c92] hover:border-[#ded6ce] focus:border-[#245f92] focus:bg-white focus:outline-none dark:text-[#f8eee5] dark:placeholder:text-[#6a6661] dark:hover:border-white/10 dark:focus:bg-[#202127]"
                                                        />
                                                    </td>
                                                    <td className="py-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVariableRow(row.id)}
                                                            className="cursor-pointer text-[#aa9c90] opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100 dark:hover:text-red-400"
                                                            title="Delete variable"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-[#d8d0c7] bg-[#faf6f0] p-8 text-center dark:border-white/10 dark:bg-white/2">
                                <AlertCircle size={28} className="text-[#a5998f] dark:text-[#77736f]" />
                                <div className="mt-3 text-sm font-semibold text-[#4e3c32] dark:text-[#d8cfc7]">
                                    No environment selected
                                </div>
                                <p className="mt-1 text-xs text-[#8f796c] dark:text-[#8f8b86]">
                                    Select an environment on the left or create a new one to manage its variables.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: RESOLVED ACTIVE VARIABLES VIEW */}
                {activeTab === "resolved" && (
                    <div className="space-y-6">
                        {/* Context Status Banner */}
                        <div className="rounded-xl border border-[#ded7ce] bg-[#fffdf9] p-6 shadow-[0_6px_20px_rgba(62,47,37,0.04)] dark:border-white/8 dark:bg-[#18191e]">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-base font-semibold tracking-[-0.02em] text-[#2c211c] dark:text-[#f8eee5]">
                                        Active Runtime Context
                                    </h2>
                                    <p className="mt-1 text-xs text-[#7e695d] dark:text-[#9e9791]">
                                        Variables currently evaluated and injected into requests for this workspace.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => void refreshDashboard()}
                                    disabled={isRefreshing}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#d8d0c7] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#3d2a21] transition-colors hover:bg-[#f8f4ef] dark:border-white/10 dark:bg-[#202127] dark:text-[#f8eee5]"
                                >
                                    <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} /> Refresh
                                </button>
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-lg border border-[#eee6df] bg-[#faf6f1] p-3.5 dark:border-white/6 dark:bg-[#1e2026]">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8f796c] dark:text-[#8f8b86]">
                                        <FolderKanban size={15} /> Active Project Environment
                                    </div>
                                    <div className="mt-2 text-sm font-bold text-[#2c211c] dark:text-[#f8eee5]">
                                        {activeProjectEnv ? activeProjectEnv.name : "None (inactive)"}
                                    </div>
                                    <div className="mt-1 text-[11px] text-[#7e695d] dark:text-[#9e9791]">
                                        {projectEnvVars.length} active variables
                                    </div>
                                </div>

                                <div className="rounded-lg border border-[#eee6df] bg-[#faf6f1] p-3.5 dark:border-white/6 dark:bg-[#1e2026]">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8f796c] dark:text-[#8f8b86]">
                                        <Globe size={15} /> Active Global Environment
                                    </div>
                                    <div className="mt-2 text-sm font-bold text-[#2c211c] dark:text-[#f8eee5]">
                                        {activeGlobalEnv ? activeGlobalEnv.name : "None (inactive)"}
                                    </div>
                                    <div className="mt-1 text-[11px] text-[#7e695d] dark:text-[#9e9791]">
                                        {globalEnvVars.length} active variables
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resolved Variables Table */}
                        <div className="rounded-xl border border-[#ded7ce] bg-[#fffdf9] p-6 shadow-[0_6px_20px_rgba(62,47,37,0.04)] dark:border-white/8 dark:bg-[#18191e]">
                            <h2 className="mb-4 text-sm font-semibold tracking-[-0.02em] text-[#2c211c] dark:text-[#f8eee5]">
                                Resolved Variables List
                            </h2>

                            {Object.keys(resolvedVariables).length === 0 ? (
                                <div className="py-8 text-center text-xs text-[#8f796c] dark:text-[#8f8b86]">
                                    No variables are currently active. Activate an environment above to use variables like{" "}
                                    <code className="rounded bg-[#eee6df] px-1.5 py-0.5 font-mono dark:bg-white/8">
                                        {"{{my_var}}"}
                                    </code>{" "}
                                    in your requests.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-[#eee6df] text-[11px] font-bold uppercase tracking-wider text-[#8f796c] dark:border-white/7 dark:text-[#8f8b86]">
                                                <th className="pb-2">Variable</th>
                                                <th className="pb-2 pl-4">Effective Value</th>
                                                <th className="pb-2 pl-4">Source Scope</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#f2ebe3] font-mono text-xs dark:divide-white/5">
                                            {Object.entries(resolvedVariables).map(([key, value]) => {
                                                const inProject = projectEnvVars.some((v) => v.key === key);
                                                const inGlobal = globalEnvVars.some((v) => v.key === key);
                                                const isOverridden = inProject && inGlobal;

                                                return (
                                                    <tr key={key} className="hover:bg-[#faf6f0] dark:hover:bg-white/2">
                                                        <td className="py-2.5 font-bold text-[#245f92] dark:text-blue-400">
                                                            {`{{${key}}}`}
                                                        </td>
                                                        <td className="py-2.5 pl-4 text-[#3d2a21] dark:text-[#e4dad3]">
                                                            {value}
                                                        </td>
                                                        <td className="py-2.5 pl-4 font-sans">
                                                            {isOverridden ? (
                                                                <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">
                                                                    Project (overrides Global)
                                                                </span>
                                                            ) : inProject ? (
                                                                <span className="inline-flex items-center gap-1 rounded bg-[#e8eef4] px-2 py-0.5 text-[10px] font-semibold text-[#245f92] dark:bg-blue-500/15 dark:text-blue-400">
                                                                    Project
                                                                </span>
                                                            ) : inGlobal ? (
                                                                <span className="inline-flex items-center gap-1 rounded bg-[#e8efea] px-2 py-0.5 text-[10px] font-semibold text-[#367557] dark:bg-emerald-500/15 dark:text-emerald-400">
                                                                    Global
                                                                </span>
                                                            ) : (
                                                                <span className="text-[#a09084] dark:text-[#77736f]">
                                                                    Unknown
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Modal for Delete Environment */}
            {envToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#201b18]/55 p-5 dark:bg-black/70">
                    <div className="w-full max-w-md rounded-[10px] border border-[#d9d2cb] bg-[#fffdf9] p-6 shadow-2xl dark:border-white/10 dark:bg-[#1d1e23]">
                        <h3 className="text-base font-bold text-[#2c211c] dark:text-[#f8eee5]">
                            Delete Environment
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-[#725e54] dark:text-[#b3aca7]">
                            Are you sure you want to delete the environment{" "}
                            <span className="font-bold text-[#2c211c] dark:text-white">
                                "{envToDelete.name}"
                            </span>
                            ? All its variables will be permanently removed.
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setEnvToDelete(null)}
                                className="cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold text-[#7e695d] hover:bg-[#efe6dd] dark:text-[#a09a94] dark:hover:bg-white/6"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="cursor-pointer rounded-lg bg-red-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};
