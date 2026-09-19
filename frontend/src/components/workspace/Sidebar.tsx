import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import { useRequestStore } from "@/stores/request.store";
import { RequestInfo } from "@/types";
import { METHODS_COLORS } from "@/utils/methods.constants";
import { requestController } from "@/controllers/request.controller";
import { useSidebarResize } from "@/hooks/useSidebarResize";
import { SidebarHeader } from "@/components/sidebar/SidebarHeader";
import { SidebarList } from "@/components/sidebar/SidebarList";
import { CreateFolderModal } from "../modals/CreateFolderModal";
import { ImportCurlModal } from "../modals/ImportCurlModal";
import { toast } from "react-toastify";
import { parseCurlCommand } from "@/utils/curl-parser";

interface SidebarProps {
    projectId: string;
    activeRequestId: string | null;
    onSelectRequest: (request: RequestInfo) => void;
}

const EMPTY_REQUESTS: RequestInfo[] = [];
const EMPTY_COLLECTIONS: [] = [];

export const Sidebar = ({ projectId, onSelectRequest, activeRequestId }: SidebarProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [isImportCurlModalOpen, setIsImportCurlModalOpen] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
    const [activeFolderIdForCreate, setActiveFolderIdForCreate] = useState<string | undefined>(undefined);

    const { width, sidebarRef, startResizing } = useSidebarResize();

    const requests = useRequestStore((state) => state.requestsByProject[projectId] ?? EMPTY_REQUESTS);
    const collections = useRequestStore((state) => state.collectionsByProject?.[projectId] ?? EMPTY_COLLECTIONS);
    const loadStatus = useRequestStore((state) => state.projectLoadStatus[projectId]);

    const loadProject = useCallback(async () => {
        if (!projectId || useRequestStore.getState().projectLoadStatus[projectId] === 'loading') return;
        useRequestStore.getState().setProjectLoadStatus(projectId, 'loading');
        try {
            await Promise.all([
                requestController.getCollections(projectId),
                requestController.getRequests(projectId),
            ]);
            useRequestStore.getState().setProjectLoadStatus(projectId, 'loaded');
        } catch (error) {
            console.error('Failed to load request list:', error);
            useRequestStore.getState().setProjectLoadStatus(projectId, 'error');
        }
    }, [projectId]);

    useEffect(() => {
        if (!loadStatus) void loadProject();
    }, [loadStatus, loadProject]);

    const handleImmediateCreateRequest = async (collectionId?: string) => {
        try {
            const newReq = await requestController.createDraftRequest(projectId, collectionId);
            onSelectRequest(newReq);
            setActiveFolderIdForCreate(undefined);
        } catch (error) {
            console.error("Error creating draft request", error);
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

    const handleImportCurl = async (command: string) => {
        const parsed = parseCurlCommand(command);
        const newRequest = await requestController.createRequestFromCurl(projectId, parsed, activeFolderIdForCreate);
        onSelectRequest(newRequest);
        toast.success("cURL request imported");
        if (parsed.warnings.length > 0) {
            console.warn("cURL import warnings:", parsed.warnings);
            toast.warning("Imported request; some cURL transport options were ignored");
        }
        setActiveFolderIdForCreate(undefined);
    };

    const handleDeleteRequest = async (req: RequestInfo) => {
        try {
            await requestController.deleteRequest(req.id, projectId);
            toast.success('Request deleted');
        } catch {
            toast.error('Failed to delete request');
        }
    };

    const openCreateFolderModal = (folderId?: string) => {
        setActiveFolderIdForCreate(folderId);
        setIsCreateFolderModalOpen(true);
    };

    const toggleFolder = (folderId: string) => {
        setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
    };

    const getMethodColor = (method: string) => METHODS_COLORS[method as keyof typeof METHODS_COLORS];

    const filteredRequests = useMemo(() => {
        if (!searchTerm.trim()) return requests;
        const term = searchTerm.toLowerCase();
        return requests.filter(
            (r) =>
                r.name.toLowerCase().includes(term) ||
                r.method.toLowerCase().includes(term) ||
                (r.url && r.url.toLowerCase().includes(term))
        );
    }, [requests, searchTerm]);

    const getRequestSelected = (request: RequestInfo) => {
        if (!activeRequestId || !request.id || request.id !== activeRequestId) return "";
        return "bg-[#eaf3fe] dark:bg-blue-500/15 text-[#1e40af] dark:text-blue-200 font-medium";
    };

    return (
        <div
            ref={sidebarRef}
            style={{ width: `${width}px` }}
            className="relative flex h-full shrink-0 flex-col overflow-hidden rounded-2xl border border-[#ded7ce] bg-[#fffdf9] shadow-xs transition-colors dark:border-white/8 dark:bg-[#18191e]"
        >
            {/* Resizer EW cushioned line */}
            <div
                className="absolute top-0 right-0 w-[2px] h-full bg-[#ded7ce]/80 dark:bg-white/10 cushioned-resizer-ew select-none z-10 transition-colors hover:bg-[#0066ff]"
                onMouseDown={startResizing}
            />

            <SidebarHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onNewRequest={() => handleImmediateCreateRequest()}
                onNewFolder={() => openCreateFolderModal()}
                onImportCurl={() => {
                    setActiveFolderIdForCreate(undefined);
                    setIsImportCurlModalOpen(true);
                }}
            />

            {/* Requests list */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                <SidebarList
                    requests={filteredRequests}
                    collections={collections}
                    hasStoredItems={requests.length > 0 || collections.length > 0}
                    loadStatus={loadStatus ?? 'loading'}
                    onRetry={() => void loadProject()}
                    projectId={projectId}
                    activeRequestId={activeRequestId}
                    onSelectRequest={onSelectRequest}
                    onDeleteRequest={handleDeleteRequest}
                    expandedFolders={expandedFolders}
                    toggleFolder={toggleFolder}
                    onCreateRequest={handleImmediateCreateRequest}
                    openCreateFolderModal={openCreateFolderModal}
                    getMethodColor={getMethodColor}
                    getRequestSelected={getRequestSelected}
                />
            </div>

            {/* Pinned bottom "+ New request" button */}
            <div className="p-3 pt-2 border-t border-[#ded7ce]/60 dark:border-white/8">
                <button
                    onClick={() => handleImmediateCreateRequest()}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#ded7ce] dark:border-white/10 bg-white dark:bg-[#20222a] hover:bg-[#f6f2ec] dark:hover:bg-[#262833] text-xs font-semibold text-[#1a1714] dark:text-[#f4eadf] shadow-xs transition-all cursor-pointer active:scale-[0.99]"
                >
                    <Plus size={14} className="text-[#5f554e] dark:text-[#a89f91]" />
                    <span>New request</span>
                </button>
            </div>

            <CreateFolderModal
                isOpen={isCreateFolderModalOpen}
                onClose={() => setIsCreateFolderModalOpen(false)}
                onCreate={(name, parentId) => handleCreateFolder(name, parentId)}
                parentId={activeFolderIdForCreate}
            />
            <ImportCurlModal
                isOpen={isImportCurlModalOpen}
                onClose={() => setIsImportCurlModalOpen(false)}
                onImport={handleImportCurl}
            />
        </div>
    );
};
