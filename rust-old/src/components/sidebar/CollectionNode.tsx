import { useDroppable } from "@dnd-kit/core";
import { ChevronDown, ChevronRight, Folder, FilePlus, FolderPlus } from "lucide-react";
import { Collection, RequestInfo } from "@/types";
import { DraggableRequestItem } from "./DraggableRequestItem";

interface CollectionNodeProps {
    collection: Collection;
    requests: RequestInfo[];
    collections: Collection[];
    onSelectRequest: (req: RequestInfo) => void;
    onDeleteRequest: (req: RequestInfo) => void;
    getRequestSelected: (req: RequestInfo) => string;
    getMethodColor: (method: string) => string;
    expandedFolders: Record<string, boolean>;
    toggleFolder: (id: string) => void;
    openCreateRequestModal: (folderId?: string) => void;
    openCreateFolderModal: (folderId?: string) => void;
}

export const CollectionNode = ({
    collection,
    requests,
    collections,
    onSelectRequest,
    onDeleteRequest,
    getRequestSelected,
    getMethodColor,
    expandedFolders,
    toggleFolder,
    openCreateRequestModal,
    openCreateFolderModal,
}: CollectionNodeProps) => {
    const isExpanded = expandedFolders[collection.id];
    const childRequests = requests.filter((r) => r.collection_id === collection.id);
    const childCollections = collections.filter((c) => c.parent_id === collection.id);

    const { setNodeRef, isOver } = useDroppable({
        id: `folder-${collection.id}`,
        data: { type: "Folder", collectionId: collection.id },
    });

    return (
        <div className="flex flex-col">
            <div
                ref={setNodeRef}
                className={`flex items-center justify-between p-1.5 rounded-lg group transition-colors ${
                    isOver
                        ? "bg-blue-100 dark:bg-blue-900/40 border border-blue-400"
                        : "hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
            >
                <div
                    onClick={() => toggleFolder(collection.id)}
                    className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 font-medium flex-1 overflow-hidden"
                >
                    {isExpanded ? (
                        <ChevronDown size={14} className="text-gray-400 shrink-0" />
                    ) : (
                        <ChevronRight size={14} className="text-gray-400 shrink-0" />
                    )}
                    <Folder size={14} className="text-[#0E61B1] shrink-0" />
                    <span className="truncate">{collection.name}</span>
                </div>

                {isExpanded && (
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0 mr-2">
                        <button
                            onClick={() => openCreateRequestModal(collection.id)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md"
                            title="New Request Here"
                        >
                            <FilePlus size={12} />
                        </button>
                        <button
                            onClick={() => openCreateFolderModal(collection.id)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md"
                            title="New Folder Here"
                        >
                            <FolderPlus size={12} />
                        </button>
                    </div>
                )}
            </div>

            {isExpanded && (
            <div className="flex flex-col gap-1 ml-3.5 border-l border-gray-200 dark:border-gray-700 pl-2">
                    {childCollections.map((child) => (
                        <CollectionNode
                            key={child.id}
                            collection={child}
                            requests={requests}
                            collections={collections}
                            onSelectRequest={onSelectRequest}
                            onDeleteRequest={onDeleteRequest}
                            getRequestSelected={getRequestSelected}
                            getMethodColor={getMethodColor}
                            expandedFolders={expandedFolders}
                            toggleFolder={toggleFolder}
                            openCreateRequestModal={openCreateRequestModal}
                            openCreateFolderModal={openCreateFolderModal}
                        />
                    ))}
                    {childRequests.map((req) => (
                        <DraggableRequestItem
                            key={req.id}
                            req={req}
                            onSelectRequest={onSelectRequest}
                            onDeleteRequest={onDeleteRequest}
                            getRequestSelected={getRequestSelected}
                            getMethodColor={getMethodColor}
                            indent={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
