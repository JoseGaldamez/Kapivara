import { useState, useEffect } from "react";
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

interface SidebarProps {
    projectId: string;
    activeRequestId: string | null;
    onSelectRequest: (request: RequestInfo) => void;
}

const EMPTY_REQUESTS: RequestInfo[] = [];
const EMPTY_COLLECTIONS: [] = [];

export const Sidebar = ({ projectId, onSelectRequest, activeRequestId }: SidebarProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
    const [activeFolderIdForCreate, setActiveFolderIdForCreate] = useState<string | undefined>(undefined);

    const { width, sidebarRef, startResizing } = useSidebarResize();

    const requests = useRequestStore((state) => state.requestsByProject[projectId] ?? EMPTY_REQUESTS);
    const collections = useRequestStore((state) => state.collectionsByProject?.[projectId] ?? EMPTY_COLLECTIONS);

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
            className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-colors relative shrink-0 overflow-x-hidden"
        >
            {/* Resize handle */}
            <div
                className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#0E61B1]/50 z-10 transition-colors"
                onMouseDown={startResizing}
            />

            <SidebarHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onNewRequest={() => openCreateRequestModal()}
                onNewFolder={() => openCreateFolderModal()}
            />

            <SidebarList
                requests={requests}
                collections={collections}
                projectId={projectId}
                activeRequestId={activeRequestId}
                onSelectRequest={onSelectRequest}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                openCreateRequestModal={openCreateRequestModal}
                openCreateFolderModal={openCreateFolderModal}
                getMethodColor={getMethodColor}
                getRequestSelected={getRequestSelected}
            />

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
        </div>
    );
};
