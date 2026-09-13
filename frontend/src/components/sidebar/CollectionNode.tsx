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
    onCreateRequest: (folderId?: string) => void;
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
    onCreateRequest,
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
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg group transition-colors select-none cursor-pointer ${
                    isOver
                        ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-400/60 text-[#1a1714] dark:text-[#f4eadf]"
                        : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-[#1a1714] dark:text-[#f4eadf]"
                }`}
            >
                <div
                    onClick={() => toggleFolder(collection.id)}
                    className="flex items-center gap-2 flex-1 overflow-hidden min-w-0"
                >
                    {isExpanded ? (
                        <ChevronDown size={13} className="text-[#8a7e72] dark:text-[#6e665d] shrink-0" />
                    ) : (
                        <ChevronRight size={13} className="text-[#8a7e72] dark:text-[#6e665d] shrink-0" />
                    )}
                    <Folder size={14} className="text-[#5f554e] dark:text-[#a89f91] shrink-0" />
                    <span className="text-xs font-semibold text-[#1a1714] dark:text-[#f4eadf] truncate">
                        {collection.name}
                    </span>
                </div>

                {isExpanded && (
                    <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 ml-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateRequest(collection.id);
                            }}
                            className="p-1 text-[#8a7e72] hover:text-[#1a1714] dark:text-[#a89f91] dark:hover:text-[#f4eadf] hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
                            title="New Request in Folder"
                        >
                            <FilePlus size={12} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                openCreateFolderModal(collection.id);
                            }}
                            className="p-1 text-[#8a7e72] hover:text-[#1a1714] dark:text-[#a89f91] dark:hover:text-[#f4eadf] hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
                            title="New Subfolder"
                        >
                            <FolderPlus size={12} />
                        </button>
                    </div>
                )}
            </div>

            {isExpanded && (
                <div className="flex flex-col gap-0.5 ml-3 pl-2.5 border-l border-[#ded7ce]/60 dark:border-white/8 my-0.5">
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
                            onCreateRequest={onCreateRequest}
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
