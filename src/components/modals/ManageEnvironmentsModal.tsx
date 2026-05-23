import { useState, useEffect, useMemo, useRef } from "react";
import { 
    X, Plus, Trash2, Edit3, Save, Globe, FolderKanban, 
    Layers, Sliders, ToggleLeft, ToggleRight, Info, AlertCircle 
} from "lucide-react";
import { Environment, EnvironmentScope, EnvironmentVariable } from "@/types";
import { useEnvironmentStore } from "@/stores/environment.store";
import { environmentController } from "@/controllers/environment.controller";
import { toast } from "react-toastify";

interface ManageEnvironmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

const EMPTY_ENVIRONMENTS: any[] = [];

const EMPTY_ROW = (): EnvironmentVariable => ({
    id: crypto.randomUUID(),
    key: '',
    value: '',
    enabled: 1
});

const parseVariables = (environment: Environment | undefined): EnvironmentVariable[] => {
    if (!environment?.variables) return [EMPTY_ROW()];
    try {
        const parsed = JSON.parse(environment.variables);
        if (!Array.isArray(parsed) || parsed.length === 0) return [EMPTY_ROW()];

        const normalized = parsed.map((item) => ({
            id: item.id || crypto.randomUUID(),
            key: item.key || '',
            value: item.value || '',
            enabled: item.enabled === 0 ? 0 : 1
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

export const ManageEnvironmentsModal = ({ isOpen, onClose, projectId }: ManageEnvironmentsModalProps) => {
    const projectEnvironments = useEnvironmentStore((state) => state.projectEnvironmentsByProject[projectId] ?? EMPTY_ENVIRONMENTS);
    const globalEnvironments = useEnvironmentStore((state) => state.globalEnvironments ?? EMPTY_ENVIRONMENTS);
    const activeProjectEnvId = useEnvironmentStore((state) => state.activeProjectEnvironmentIdByProject[projectId] ?? null);
    const activeGlobalEnvId = useEnvironmentStore((state) => state.activeGlobalEnvironmentId ?? null);

    // Selected environment inside the modal to EDIT
    const [selectedEnv, setSelectedEnv] = useState<{ id: string; scope: EnvironmentScope } | null>(null);
    const [envName, setEnvName] = useState("");
    const [variables, setVariables] = useState<EnvironmentVariable[]>([EMPTY_ROW()]);
    const [newEnvName, setNewEnvName] = useState("");
    const [newEnvScope, setNewEnvScope] = useState<EnvironmentScope>("project");
    const [resolvedVariables, setResolvedVariables] = useState<Record<string, string>>({});
    const [showResolvedDashboard, setShowResolvedDashboard] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

    // Fetch details of active environment being edited
    const activeEditingEnv = useMemo(() => {
        if (!selectedEnv) return null;
        const list = selectedEnv.scope === "project" ? projectEnvironments : globalEnvironments;
        return list.find(e => e.id === selectedEnv.id) || null;
    }, [selectedEnv, projectEnvironments, globalEnvironments]);

    // Track active editing environment changes
    useEffect(() => {
        if (activeEditingEnv) {
            setEnvName(activeEditingEnv.name);
            setVariables(parseVariables(activeEditingEnv));
        } else {
            setEnvName("");
            setVariables([EMPTY_ROW()]);
        }
    }, [activeEditingEnv?.id]);

    // Bootstrap data when opening modal
    useEffect(() => {
        if (isOpen) {
            const init = async () => {
                await environmentController.bootstrap(projectId);
                const resolved = await environmentController.getResolvedVariables(projectId);
                setResolvedVariables(resolved);

                // Auto-select first environment if nothing selected
                if (projectEnvironments.length > 0) {
                    setSelectedEnv({ id: projectEnvironments[0].id, scope: "project" });
                } else if (globalEnvironments.length > 0) {
                    setSelectedEnv({ id: globalEnvironments[0].id, scope: "global" });
                }
            };
            init();
        }
    }, [isOpen, projectId]);

    const refreshDashboard = async () => {
        const resolved = await environmentController.getResolvedVariables(projectId);
        setResolvedVariables(resolved);
    };

    if (!isOpen) return null;

    const handleCreateEnvironment = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanName = newEnvName.trim();
        if (!cleanName) {
            toast.warning("Environment name is required");
            return;
        }

        try {
            const created = await environmentController.createEnvironment(newEnvScope, cleanName, newEnvScope === "project" ? projectId : undefined);
            setNewEnvName("");
            await refreshDashboard();
            setSelectedEnv({ id: created.id, scope: newEnvScope });
            toast.success(`Environment '${cleanName}' created`);
        } catch (error) {
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
            await environmentController.renameEnvironment(selectedEnv.scope, activeEditingEnv.id, cleanName, selectedEnv.scope === "project" ? projectId : undefined);
            await refreshDashboard();
            toast.success("Environment renamed");
        } catch (error) {
            toast.error("Failed to rename environment");
        }
    };

    const handleDeleteEnvironment = () => {
        if (!activeEditingEnv || !selectedEnv) return;
        setIsConfirmDeleteOpen(true);
    };

    const confirmDeleteEnvironment = async () => {
        if (!activeEditingEnv || !selectedEnv) return;
        setIsConfirmDeleteOpen(false);

        try {
            const name = activeEditingEnv.name;
            await environmentController.deleteEnvironment(selectedEnv.scope, activeEditingEnv.id, selectedEnv.scope === "project" ? projectId : undefined);
            await refreshDashboard();
            setSelectedEnv(null);
            toast.success(`Environment '${name}' deleted successfully`);

            // Select another environment if possible
            if (projectEnvironments.length > 0) {
                setSelectedEnv({ id: projectEnvironments[0].id, scope: "project" });
            } else if (globalEnvironments.length > 0) {
                setSelectedEnv({ id: globalEnvironments[0].id, scope: "global" });
            }
        } catch (error) {
            toast.error("Failed to delete environment");
        }
    };

    const handleSaveVariables = async () => {
        if (!activeEditingEnv || !selectedEnv) return;

        const finalVariables = variables
            .filter((row) => row.key.trim() !== "")
            .map((row) => ({
                ...row,
                key: row.key.trim(),
                value: row.value || '',
                enabled: row.enabled === 0 ? 0 : 1
            }));

        try {
            await environmentController.updateEnvironmentVariables(selectedEnv.scope, activeEditingEnv.id, finalVariables, selectedEnv.scope === "project" ? projectId : undefined);
            await refreshDashboard();
            toast.success("Environment variables saved");
        } catch (error) {
            toast.error("Failed to save variables");
        }
    };

    const updateVariableField = (id: string, field: keyof EnvironmentVariable, value: any) => {
        const next = variables.map((row) => row.id === id ? { ...row, [field]: value } : row);
        const last = next[next.length - 1];
        if (last.key || last.value) {
            next.push(EMPTY_ROW());
        }
        setVariables(next);
    };

    const removeVariableRow = (id: string) => {
        const next = variables.filter((row) => row.id !== id);
        if (next.length === 0 || next[next.length - 1].key || next[next.length - 1].value) {
            next.push(EMPTY_ROW());
        }
        setVariables(next);
    };

    const handleSelectActive = async (envId: string | null, scope: EnvironmentScope) => {
        try {
            await environmentController.setActiveEnvironment(scope, envId, scope === "project" ? projectId : undefined);
            await refreshDashboard();
            toast.success("Workspace environment updated");
        } catch (error) {
            toast.error("Failed to set active environment");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 transition-all duration-300">
            <div className="bg-[#f8fafc] dark:bg-[#0b0f19] border border-gray-200 dark:border-gray-800/80 rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden text-gray-800 dark:text-gray-200 transition-colors">
                
                {/* Header */}
                <div className="px-6 py-4 bg-white dark:bg-[#111827]/40 border-b border-gray-200 dark:border-gray-800/80 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                            <Sliders size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Environment Control Dashboard</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Manage and preview global and project variables</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowResolvedDashboard(!showResolvedDashboard)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors border ${
                                showResolvedDashboard 
                                    ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <Layers size={13} />
                            {showResolvedDashboard ? "Show Variables Editor" : "Show Variables Resolution Pipeline"}
                        </button>

                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Body */}
                <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-gray-50/50 dark:bg-gray-950/20">
                    
                    {/* Left Sidebar - List of Environments */}
                    <div className="w-full md:w-72 border-r border-gray-200 dark:border-gray-800/80 bg-white dark:bg-[#0b0f19] flex flex-col overflow-y-auto p-4 shrink-0">
                        
                        {/* Scope Headers */}
                        <div className="space-y-6">
                            
                            {/* Project Scope */}
                            <div>
                                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-2">
                                    <FolderKanban size={12} className="text-blue-500" />
                                    Project Scope
                                </h4>
                                <div className="space-y-1">
                                    {projectEnvironments.map((env) => {
                                        const isActive = activeProjectEnvId === env.id;
                                        const isSelected = selectedEnv?.id === env.id && selectedEnv?.scope === "project";
                                        return (
                                            <div 
                                                key={env.id}
                                                onClick={() => setSelectedEnv({ id: env.id, scope: "project" })}
                                                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all ${
                                                    isSelected 
                                                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 shadow-sm' 
                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-900/60 text-gray-700 dark:text-gray-300 border border-transparent'
                                                }`}
                                            >
                                                <span className="truncate pr-2">{env.name}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectActive(isActive ? null : env.id, "project");
                                                    }}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 transition-colors hover:scale-105 duration-150 ${
                                                        isActive
                                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 dark:text-emerald-400'
                                                            : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-blue-500/50 hover:text-blue-500'
                                                    }`}
                                                >
                                                    {isActive ? "Active" : "Activate"}
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {projectEnvironments.length === 0 && (
                                        <p className="text-xs text-gray-400 dark:text-gray-500 italic px-3 py-1">No project environments</p>
                                    )}
                                </div>
                            </div>

                            {/* Global Scope */}
                            <div>
                                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-2">
                                    <Globe size={12} className="text-violet-500" />
                                    Global Scope
                                </h4>
                                <div className="space-y-1">
                                    {globalEnvironments.map((env) => {
                                        const isActive = activeGlobalEnvId === env.id;
                                        const isSelected = selectedEnv?.id === env.id && selectedEnv?.scope === "global";
                                        return (
                                            <div 
                                                key={env.id}
                                                onClick={() => setSelectedEnv({ id: env.id, scope: "global" })}
                                                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all ${
                                                    isSelected 
                                                        ? 'bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/30 shadow-sm' 
                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-900/60 text-gray-700 dark:text-gray-300 border border-transparent'
                                                }`}
                                            >
                                                <span className="truncate pr-2">{env.name}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectActive(isActive ? null : env.id, "global");
                                                    }}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 transition-colors hover:scale-105 duration-150 ${
                                                        isActive
                                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 dark:text-emerald-400'
                                                            : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-violet-500/50 hover:text-violet-500'
                                                    }`}
                                                >
                                                    {isActive ? "Active" : "Activate"}
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {globalEnvironments.length === 0 && (
                                        <p className="text-xs text-gray-400 dark:text-gray-500 italic px-3 py-1">No global environments</p>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Quick Creator */}
                        <form onSubmit={handleCreateEnvironment} className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800/80">
                            <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Create Environment</h5>
                            <input
                                type="text"
                                placeholder="Environment name..."
                                value={newEnvName}
                                onChange={(e) => setNewEnvName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                            />
                            <div className="flex gap-1.5 mb-3">
                                <button
                                    type="button"
                                    onClick={() => setNewEnvScope("project")}
                                    className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all ${
                                        newEnvScope === "project"
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    Project
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewEnvScope("global")}
                                    className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all ${
                                        newEnvScope === "global"
                                            ? 'bg-violet-500 text-white border-violet-500'
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    Global
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={!newEnvName.trim()}
                                className="w-full py-1.5 bg-gray-900 dark:bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1"
                            >
                                <Plus size={12} /> Create
                            </button>
                        </form>
                    </div>

                    {/* Right Panel - Active Content */}
                    <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                        {showResolvedDashboard ? (
                            
                            /* Variable Resolution Dashboard Preview */
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="bg-white dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-200 dark:border-gray-800/80 shadow-sm">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <Layers size={16} className="text-blue-500" />
                                        Merged Resolved Variables Preview
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                        Here you see variables as they will be interpolated in your active HTTP requests. 
                                        Project-scoped variables take precedence and will overwrite global variables of the same key name.
                                    </p>

                                    {Object.keys(resolvedVariables).length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-gray-400 text-xs">
                                            <AlertCircle size={24} className="mb-2 text-gray-300 dark:text-gray-600" />
                                            No environment variables are currently active. Activate a global or project environment on the sidebar.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2">
                                            {Object.entries(resolvedVariables).map(([key, value]) => {
                                                // Determine where this variable came from
                                                const inProject = projectEnvironments.find(e => e.id === activeProjectEnvId)?.variables;
                                                const inGlobal = globalEnvironments.find(e => e.id === activeGlobalEnvId)?.variables;
                                                
                                                let hasProjectOverride = false;
                                                let isFromProject = false;
                                                
                                                try {
                                                    const pParsed = inProject ? JSON.parse(inProject) : [];
                                                    const gParsed = inGlobal ? JSON.parse(inGlobal) : [];
                                                    const inProjList = pParsed.some((v: any) => v.key === key && v.enabled !== 0);
                                                    const inGlobList = gParsed.some((v: any) => v.key === key && v.enabled !== 0);
                                                    
                                                    if (inProjList && inGlobList) {
                                                        hasProjectOverride = true;
                                                    }
                                                    if (inProjList) {
                                                        isFromProject = true;
                                                    }
                                                } catch {}

                                                return (
                                                    <div 
                                                        key={key} 
                                                        className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800/60 rounded-xl font-mono text-xs flex flex-col justify-between gap-2 shadow-sm hover:border-blue-500/25 transition-all"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-blue-600 dark:text-blue-400 font-bold">{`{{${key}}}`}</span>
                                                            <div className="flex items-center gap-1.5">
                                                                {hasProjectOverride && (
                                                                    <span className="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-[9px] font-extrabold font-sans">
                                                                        Override Active
                                                                    </span>
                                                                )}
                                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold font-sans ${
                                                                    isFromProject 
                                                                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                                                        : 'bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'
                                                                }`}>
                                                                    {isFromProject ? "Project Scope" : "Global Scope"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-gray-800 dark:text-gray-200 break-all select-all pt-1 border-t border-gray-200/50 dark:border-gray-800/40">
                                                            {value || <em className="text-gray-400 dark:text-gray-600">empty</em>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : activeEditingEnv ? (
                            
                            /* Standard Variables Table Editor Workspace */
                            <div className="flex-1 flex flex-col overflow-hidden p-6">
                                
                                {/* Top Toolbar: Rename / Delete / Scope indicators */}
                                <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between pb-4 border-b border-gray-200 dark:border-gray-800/80 shrink-0">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <input
                                            value={envName}
                                            onChange={(e) => setEnvName(e.target.value)}
                                            className="px-3 py-1.5 text-base font-bold bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800/80 rounded-xl focus:ring-1 focus:ring-blue-500 max-w-xs focus:outline-none"
                                        />
                                        <button 
                                            onClick={handleRenameEnvironment}
                                            className="p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-pointer transition-colors"
                                            title="Rename Environment"
                                        >
                                            <Edit3 size={15} />
                                        </button>
                                        <button 
                                            onClick={handleDeleteEnvironment}
                                            className="p-2 border border-red-200 dark:border-red-900/60 bg-white dark:bg-gray-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 cursor-pointer transition-colors"
                                            title="Delete Environment"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                                            selectedEnv?.scope === "project" 
                                                ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' 
                                                : 'bg-violet-500/10 border-violet-500/20 text-violet-500'
                                        }`}>
                                            {selectedEnv?.scope === "project" ? <FolderKanban size={13} /> : <Globe size={13} />}
                                            {selectedEnv?.scope === "project" ? "Project Environment" : "Global Environment"}
                                        </span>

                                        <button 
                                            onClick={handleSaveVariables}
                                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950/10 transition-colors"
                                        >
                                            <Save size={13} />
                                            Save Changes
                                        </button>
                                    </div>
                                </div>

                                {/* Variable Rows Grid */}
                                <div className="flex-1 overflow-y-auto mt-4 pr-1">
                                    <table className="w-full text-left border-collapse min-w-[500px]">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-800 text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                <th className="py-2.5 px-3 w-12 text-center">Active</th>
                                                <th className="py-2.5 px-3">Variable Key</th>
                                                <th className="py-2.5 px-3">Value</th>
                                                <th className="py-2.5 px-3 w-12 text-center">Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {variables.map((row, index) => {
                                                const isLast = index === variables.length - 1;
                                                return (
                                                    <tr 
                                                        key={row.id} 
                                                        className="group border-b border-gray-100 dark:border-gray-800/40 hover:bg-gray-100/30 dark:hover:bg-gray-900/20 transition-all duration-100"
                                                    >
                                                        <td className="py-2 px-3 text-center">
                                                            {!isLast && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateVariableField(row.id, 'enabled', row.enabled === 1 ? 0 : 1)}
                                                                    className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
                                                                >
                                                                    {row.enabled === 1 ? (
                                                                        <ToggleRight className="text-blue-500" size={24} />
                                                                    ) : (
                                                                        <ToggleLeft className="text-gray-400 dark:text-gray-600" size={24} />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </td>
                                                        <td className="py-1 px-3">
                                                            <input
                                                                value={row.key}
                                                                placeholder="e.g. base_url"
                                                                onChange={(e) => updateVariableField(row.id, 'key', e.target.value)}
                                                                className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-lg text-xs font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:bg-white dark:focus:bg-gray-900"
                                                            />
                                                        </td>
                                                        <td className="py-1 px-3">
                                                            <input
                                                                value={row.value}
                                                                placeholder="e.g. https://api.myproject.com"
                                                                onChange={(e) => updateVariableField(row.id, 'value', e.target.value)}
                                                                className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-lg text-xs font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:bg-white dark:focus:bg-gray-900"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-3 text-center">
                                                            {!isLast && (
                                                                <button
                                                                    onClick={() => removeVariableRow(row.id)}
                                                                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400/80 text-sm">
                                <AlertCircle size={32} className="mb-2 text-gray-300 dark:text-gray-700" />
                                <p>Select an environment on the left sidebar to start configuring variables.</p>
                            </div>
                        )}
            </div>

            {/* Delete Confirmation Modal Overlay */}
            {isConfirmDeleteOpen && activeEditingEnv && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 text-gray-800 dark:text-gray-200">
                        <div className="flex items-center gap-3 text-red-500 mb-4">
                            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30">
                                <AlertCircle size={24} />
                            </div>
                            <h4 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Confirm Deletion</h4>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                            Are you sure you want to permanently delete the environment <strong className="text-gray-900 dark:text-white font-bold">"{activeEditingEnv.name}"</strong>? This action cannot be undone and all variables stored in it will be lost.
                        </p>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setIsConfirmDeleteOpen(false)}
                                className="px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteEnvironment}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-lg shadow-red-950/15 transition-colors"
                            >
                                Delete Environment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
        </div>
    );
};
