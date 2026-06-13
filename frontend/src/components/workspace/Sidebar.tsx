import { useState, useEffect, useMemo, useRef } from "react";
import { useRequestStore } from "@/stores/request.store";
import { RequestInfo } from "@/types";
import { METHODS_COLORS } from "@/utils/methods.constants";
import { requestController } from "@/controllers/request.controller";
import { useSidebarResize } from "@/hooks/useSidebarResize";
import { SidebarHeader } from "@/components/sidebar/SidebarHeader";
import { SidebarList } from "@/components/sidebar/SidebarList";
import { CreateRequestModal } from "../modals/CreateRequestModal";
import { CreateFolderModal } from "../modals/CreateFolderModal";
import { toast } from "react-toastify";
import { Sliders, ChevronDown, Globe, FolderKanban } from "lucide-react";
import { useEnvironmentStore } from "@/stores/environment.store";
import { environmentController } from "@/controllers/environment.controller";
import { ManageEnvironmentsModal } from "../modals/ManageEnvironmentsModal";

interface SidebarProps {
    projectId: string;
    activeRequestId: string | null;
    onSelectRequest: (request: RequestInfo) => void;
}

const EMPTY_REQUESTS: RequestInfo[] = [];
const EMPTY_COLLECTIONS: [] = [];
const EMPTY_ENVIRONMENTS: any[] = [];

export const Sidebar = ({ projectId, onSelectRequest, activeRequestId }: SidebarProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
    const [activeFolderIdForCreate, setActiveFolderIdForCreate] = useState<string | undefined>(undefined);
    const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
    const [resolvedVariables, setResolvedVariables] = useState<Record<string, string>>({});
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const { width, sidebarRef, startResizing } = useSidebarResize();

    const requests = useRequestStore((state) => state.requestsByProject[projectId] ?? EMPTY_REQUESTS);
    const collections = useRequestStore((state) => state.collectionsByProject?.[projectId] ?? EMPTY_COLLECTIONS);

    const projectEnvironments = useEnvironmentStore((state) => state.projectEnvironmentsByProject[projectId] ?? EMPTY_ENVIRONMENTS);
    const globalEnvironments = useEnvironmentStore((state) => state.globalEnvironments ?? EMPTY_ENVIRONMENTS);
    const activeProjectEnvId = useEnvironmentStore((state) => state.activeProjectEnvironmentIdByProject[projectId] ?? null);
    const activeGlobalEnvId = useEnvironmentStore((state) => state.activeGlobalEnvironmentId ?? null);

    // Sync resolved variables in real-time
    useEffect(() => {
        const syncVariables = async () => {
            await environmentController.bootstrap(projectId);
            const resolved = await environmentController.getResolvedVariables(projectId);
            setResolvedVariables(resolved);
        };
        if (projectId) {
            syncVariables();
        }
    }, [projectId, activeProjectEnvId, activeGlobalEnvId, projectEnvironments, globalEnvironments]);

    // Find active environment name
    const activeEnvName = useMemo(() => {
        if (activeProjectEnvId) {
            const env = projectEnvironments.find(e => e.id === activeProjectEnvId);
            if (env) return env.name;
        }
        if (activeGlobalEnvId) {
            const env = globalEnvironments.find(e => e.id === activeGlobalEnvId);
            if (env) return `${env.name} (Global)`;
        }
        return null;
    }, [activeProjectEnvId, activeGlobalEnvId, projectEnvironments, globalEnvironments]);

    useEffect(() => {
        if (requests.length === 0 && collections.length === 0 && projectId) {
            Promise.all([
                requestController.getCollections(projectId),
                requestController.getRequests(projectId),
            ]);
        }
    }, [projectId]);

    const handleCreateRequest = async (name: string, method: string, collectionId?: string) => {
        try {
            const newReq = await requestController.createRequest(projectId, name, method, collectionId);
            onSelectRequest(newReq);
            setActiveFolderIdForCreate(undefined);
        } catch (error) {
            console.error("Error creating request", error);
        }
    };

    const handleCreateFolder = async (name: string, parentId?: string) => {
        try {
            await requestController.createCollection(projectId, name, parentId);
            toast.success("Folder created successfully");
            setActiveFolderIdForCreate(undefined);
        } catch (error) {
            console.error("Error creating folder", error);
            toast.error("Failed to create folder");
        }
    };

    const handleDeleteRequest = async (req: RequestInfo) => {
        try {
            await requestController.deleteRequest(req.id, projectId);
            toast.success('Request deleted');
        } catch {
            toast.error('Failed to delete request');
        }
    };

    const openCreateRequestModal = (folderId?: string) => {
        setActiveFolderIdForCreate(folderId);
        setIsCreateModalOpen(true);
    };

    const openCreateFolderModal = (folderId?: string) => {
        setActiveFolderIdForCreate(folderId);
        setIsCreateFolderModalOpen(true);
    };

    const toggleFolder = (folderId: string) => {
        setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
    };

    const getMethodColor = (method: string) => METHODS_COLORS[method as keyof typeof METHODS_COLORS];

    const getRequestSelected = (request: RequestInfo) => {
        if (!activeRequestId || !request.id || request.id !== activeRequestId) return "";
        return "bg-blue-200 dark:bg-blue-950 text-gray-800 dark:text-gray-200 font-bold";
    };

    return (
        <div
            ref={sidebarRef}
            style={{ width: `${width}px` }}
            className="flex flex-col h-full bg-white dark:bg-[#16161E] rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm relative shrink-0 transition-colors overflow-hidden"
        >
            {/* Resizer EW cushioned line */}
            <div
                className="absolute top-0 right-0 w-[1px] h-full bg-slate-200 dark:bg-slate-800/80 cushioned-resizer-ew z-10 transition-colors hover:bg-[#0E61B1]/60"
                onMouseDown={startResizing}
            />

            <SidebarHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onNewRequest={() => openCreateRequestModal()}
                onNewFolder={() => openCreateFolderModal()}
            />

            {/* Requests list — flex-1 so it compresses when env panel opens */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                <SidebarList
                    requests={requests}
                    collections={collections}
                    projectId={projectId}
                    activeRequestId={activeRequestId}
                    onSelectRequest={onSelectRequest}
                    onDeleteRequest={handleDeleteRequest}
                    expandedFolders={expandedFolders}
                    toggleFolder={toggleFolder}
                    openCreateRequestModal={openCreateRequestModal}
                    openCreateFolderModal={openCreateFolderModal}
                    getMethodColor={getMethodColor}
                    getRequestSelected={getRequestSelected}
                />
            </div>

            {/* ── Environment Quick status widget ── */}
            <div className="shrink-0 border-t border-slate-200/50 dark:border-slate-800/40 bg-slate-50 dark:bg-[#0D0D11]/60 p-3.5 flex flex-col gap-2 transition-colors relative" ref={dropdownRef}>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        Environment
                    </span>
                    <button
                        onClick={() => setIsEnvModalOpen(true)}
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline cursor-pointer transition-colors"
                    >
                        <Sliders size={11} />
                        Manage
                    </button>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl text-left cursor-pointer transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                                activeEnvName 
                                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' 
                                    : 'bg-orange-400'
                            }`} />
                            <span className={`text-xs font-semibold truncate ${
                                activeEnvName 
                                    ? 'text-gray-700 dark:text-gray-200' 
                                    : 'text-gray-400 dark:text-gray-500 italic'
                            }`}>
                                {activeEnvName || "No active environment"}
                            </span>
                        </div>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1 ${isDropdownOpen ? 'rotate-185' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute bottom-full left-0 right-0 mb-1.5 z-40 rounded-xl border border-gray-200 dark:border-gray-850 bg-white dark:bg-[#0b0f19] shadow-xl p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200 max-h-72 overflow-y-auto">
                            <button
                                onClick={async () => {
                                    await environmentController.setActiveEnvironment('project', null, projectId);
                                    await environmentController.setActiveEnvironment('global', null);
                                    setIsDropdownOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-orange-650 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 cursor-pointer transition-colors flex items-center justify-between"
                            >
                                <span>No Active Environment</span>
                                {(!activeProjectEnvId && !activeGlobalEnvId) && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                )}
                            </button>

                            <div className="my-1 border-t border-gray-100 dark:border-gray-800/60" />

                            <div className="px-3 py-1">
                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-450 dark:text-gray-550 flex items-center gap-1.5 select-none">
                                    <FolderKanban size={10} className="text-blue-500" />
                                    Project Scope
                                </span>
                            </div>

                            <div className="space-y-0.5">
                                {projectEnvironments.map((env) => {
                                    const isActive = activeProjectEnvId === env.id;
                                    return (
                                        <button
                                            key={env.id}
                                            onClick={async () => {
                                                await environmentController.setActiveEnvironment('project', isActive ? null : env.id, projectId);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between ${
                                                isActive 
                                                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' 
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-900/40 text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            <span className="truncate">{env.name}</span>
                                            {isActive && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                                            )}
                                        </button>
                                    );
                                })}
                                {projectEnvironments.length === 0 && (
                                    <span className="block px-3 py-1 text-[11px] text-gray-400 dark:text-gray-500 italic select-none">
                                        No project environments
                                    </span>
                                )}
                            </div>

                            <div className="my-1 border-t border-gray-100 dark:border-gray-800/60" />

                            <div className="px-3 py-1">
                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-450 dark:text-gray-550 flex items-center gap-1.5 select-none">
                                    <Globe size={10} className="text-violet-500" />
                                    Global Scope
                                </span>
                            </div>

                            <div className="space-y-0.5">
                                {globalEnvironments.map((env) => {
                                    const isActive = activeGlobalEnvId === env.id;
                                    return (
                                        <button
                                            key={env.id}
                                            onClick={async () => {
                                                await environmentController.setActiveEnvironment('global', isActive ? null : env.id);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between ${
                                                isActive 
                                                    ? 'bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400' 
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-900/40 text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            <span className="truncate">{env.name}</span>
                                            {isActive && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
                                            )}
                                        </button>
                                    );
                                })}
                                {globalEnvironments.length === 0 && (
                                    <span className="block px-3 py-1 text-[11px] text-gray-400 dark:text-gray-500 italic select-none">
                                        No global environments
                                    </span>
                                )}
                            </div>

                        </div>
                    )}
                </div>

                {/* Variable Previews Tag Grid */}
                <div className="mt-1">
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                        {Object.keys(resolvedVariables).length > 0 ? (
                            Object.keys(resolvedVariables).map((key) => (
                                <span 
                                    key={key} 
                                    title={`${key}: ${resolvedVariables[key]}`}
                                    className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-blue-50/60 dark:bg-blue-950/20 text-[#0E61B1] dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 truncate max-w-[120px] select-none"
                                >
                                    {key}
                                </span>
                            ))
                        ) : (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 italic select-none">
                                No active variables
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <CreateRequestModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={(name, method, collectionId) => handleCreateRequest(name, method, collectionId)}
                collectionId={activeFolderIdForCreate}
            />

            <CreateFolderModal
                isOpen={isCreateFolderModalOpen}
                onClose={() => setIsCreateFolderModalOpen(false)}
                onCreate={(name, parentId) => handleCreateFolder(name, parentId)}
                parentId={activeFolderIdForCreate}
            />

            <ManageEnvironmentsModal
                isOpen={isEnvModalOpen}
                onClose={() => setIsEnvModalOpen(false)}
                projectId={projectId}
            />
        </div>
    );
};
