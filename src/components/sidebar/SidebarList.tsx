import { useDroppable, DndContext, DragOverlay, pointerWithin, MeasuringStrategy } from "@dnd-kit/core";
import { Collection, RequestInfo } from "@/types";
import { CollectionNode } from "./CollectionNode";
import { DraggableRequestItem } from "./DraggableRequestItem";
import { useSidebarDnd } from "@/hooks/useSidebarDnd";
import { METHODS_COLORS } from "@/utils/methods.constants";
import { GripVertical } from "lucide-react";

interface SidebarListProps {
    requests: RequestInfo[];
    collections: Collection[];
    projectId: string;
    activeRequestId: string | null;
    onSelectRequest: (req: RequestInfo) => void;
    onDeleteRequest: (req: RequestInfo) => void;
    expandedFolders: Record<string, boolean>;
    toggleFolder: (id: string) => void;
    openCreateRequestModal: (folderId?: string) => void;
    openCreateFolderModal: (folderId?: string) => void;
    getMethodColor: (method: string) => string;
    getRequestSelected: (req: RequestInfo) => string;
}

/** Lightweight clone rendered inside DragOverlay, always follows the cursor */
const RequestDragPreview = ({ req }: { req: RequestInfo }) => {
    const color = METHODS_COLORS[req.method as keyof typeof METHODS_COLORS];
    return (
        <div className="flex items-center gap-2 p-1.5 pl-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-blue-400 opacity-90 text-sm text-gray-700 dark:text-gray-300 select-none pointer-events-none">
            <span className={`text-[10px] font-bold w-8 shrink-0 ${color}`}>{req.method}</span>
            <span className="truncate flex-1">{req.name}</span>
            <GripVertical size={14} className="text-gray-400 shrink-0" />
        </div>
    );
};

export const SidebarList = ({
    requests,
    collections,
    projectId,
    onSelectRequest,
    onDeleteRequest,
    expandedFolders,
    toggleFolder,
    openCreateRequestModal,
    openCreateFolderModal,
    getMethodColor,
    getRequestSelected,
}: SidebarListProps) => {
    const { sensors, draggingItem, isOverRoot, handleDragStart, handleDragOver, handleDragEnd } =
        useSidebarDnd({ requests, projectId });

    const { setNodeRef: setExplicitRootNodeRef } = useDroppable({
        id: "explicit-root",
        data: { type: "Root", collectionId: null },
    });

    const rootCollections = collections.filter((c) => !c.parent_id);
    const rootRequests = requests.filter((r) => !r.collection_id);

    const isDraggingFromCollection = !!(draggingItem && draggingItem.collection_id);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 transition-colors">
                {requests.length === 0 && collections.length === 0 ? (
                    <div className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
                        No requests or folders yet. <br /> Create one to get started!
                    </div>
                ) : (
                    <div className="flex flex-col gap-1 min-h-full pb-2">
                        {rootCollections.map((collection) => (
                            <CollectionNode
                                key={collection.id}
                                collection={collection}
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

                        {rootRequests.map((req) => (
                            <DraggableRequestItem
                                key={req.id}
                                req={req}
                                onSelectRequest={onSelectRequest}
                                onDeleteRequest={onDeleteRequest}
                                getRequestSelected={getRequestSelected}
                                getMethodColor={getMethodColor}
                                indent={false}
                            />
                        ))}

                        {/* Root drop zone — always in DOM, visible while dragging from a collection */}
                        <div
                            ref={setExplicitRootNodeRef}
                            className={`w-full transition-all duration-200 ease-in-out ${
                                isDraggingFromCollection
                                    ? `flex-1 min-h-[80px] mt-3 rounded-xl border-2 border-dashed flex items-center justify-center text-xs font-semibold ${
                                          isOverRoot && isDraggingFromCollection
                                              ? "bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400"
                                              : "bg-gray-100 dark:bg-gray-800/60 border-gray-300 dark:border-gray-700 text-gray-400"
                                      }`
                                    : "h-0 opacity-0 overflow-hidden pointer-events-none"
                            }`}
                        >
                            {isDraggingFromCollection && (
                                <span className="px-2 text-center leading-tight">
                                    {isOverRoot ? "↓ Releasing will move to root" : "Drop here to remove from folder"}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* DragOverlay — renders the dragged item as a floating ghost always visible */}
            <DragOverlay dropAnimation={null}>
                {draggingItem ? <RequestDragPreview req={draggingItem} /> : null}
            </DragOverlay>
        </DndContext>
    );
};
