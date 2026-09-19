import { useDroppable, DndContext, DragOverlay, pointerWithin, MeasuringStrategy } from "@dnd-kit/core";
import { Collection, RequestInfo } from "@/types";
import { CollectionNode } from "./CollectionNode";
import { DraggableRequestItem } from "./DraggableRequestItem";
import { useSidebarDnd } from "@/hooks/useSidebarDnd";
import { METHODS_COLORS } from "@/utils/methods.constants";
import { getRequestDisplayName } from "@/utils/request-name.util";
import { GripVertical } from "lucide-react";
import type { LoadStatus } from "@/stores/request.store";

interface SidebarListProps {
    requests: RequestInfo[];
    collections: Collection[];
    hasStoredItems: boolean;
    loadStatus: LoadStatus;
    onRetry: () => void;
    projectId: string;
    activeRequestId: string | null;
    onSelectRequest: (req: RequestInfo) => void;
    onDeleteRequest: (req: RequestInfo) => void;
    expandedFolders: Record<string, boolean>;
    toggleFolder: (id: string) => void;
    onCreateRequest: (folderId?: string) => void;
    openCreateFolderModal: (folderId?: string) => void;
    getMethodColor: (method: string) => string;
    getRequestSelected: (req: RequestInfo) => string;
}

/** Lightweight clone rendered inside DragOverlay, always follows the cursor */
const RequestDragPreview = ({ req }: { req: RequestInfo }) => {
    const color = METHODS_COLORS[req.method as keyof typeof METHODS_COLORS];
    const displayMethod = req.method === "DELETE" ? "DEL" : req.method;
    return (
        <div className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg bg-[#fffdf9] dark:bg-[#1c1d24] shadow-xl border border-[#0066ff] opacity-95 text-xs text-[#1a1714] dark:text-[#f4eadf] select-none pointer-events-none font-medium">
            <span className={`text-[11px] font-bold font-mono w-9 shrink-0 ${color}`}>{displayMethod}</span>
            <span className="truncate flex-1">{getRequestDisplayName(req)}</span>
            <GripVertical size={13} className="text-[#8a7e72] shrink-0" />
        </div>
    );
};

export const SidebarList = ({
    requests,
    collections,
    hasStoredItems,
    loadStatus,
    onRetry,
    projectId,
    onSelectRequest,
    onDeleteRequest,
    expandedFolders,
    toggleFolder,
    onCreateRequest,
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
            <div className="p-2 transition-colors">
                {loadStatus === 'loading' ? (
                    <div role="status" aria-label="Loading requests" className="space-y-2 px-1 pt-2 motion-safe:animate-pulse">
                        {Array.from({ length: 6 }, (_, index) => (
                            <div key={index} className="flex h-8 items-center gap-2 rounded-lg bg-[#f6f2ec] px-2.5 dark:bg-white/[0.04]">
                                <span className="h-3 w-8 rounded bg-[#e5ded6] dark:bg-white/10" />
                                <span className={`h-3 rounded bg-[#e5ded6] dark:bg-white/10 ${index % 2 ? 'w-24' : 'w-36'}`} />
                            </div>
                        ))}
                    </div>
                ) : loadStatus === 'error' ? (
                    <div role="alert" className="mt-6 px-3 text-center text-xs text-[#8a7e72] dark:text-[#a89f91]">
                        <p>Could not load requests.</p>
                        <button type="button" onClick={onRetry} className="mt-2 font-semibold text-[#0066ff] hover:underline">Retry</button>
                    </div>
                ) : requests.length === 0 && collections.length === 0 ? (
                    <div className="text-xs text-[#8a7e72] dark:text-[#a89f91] text-center mt-6 py-4">
                        {hasStoredItems ? 'No requests match your search.' : <>No requests or folders yet. <br /> Create one to get started!</>}
                    </div>
                ) : (
                    <div className="flex flex-col gap-0.5 min-h-full pb-32">
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
                                onCreateRequest={onCreateRequest}
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
                                    ? `flex-1 min-h-[70px] mt-3 rounded-xl border-2 border-dashed flex items-center justify-center text-xs font-semibold ${
                                          isOverRoot && isDraggingFromCollection
                                              ? "bg-blue-50 dark:bg-blue-900/30 border-[#0066ff] text-[#0066ff] dark:text-blue-400"
                                              : "bg-black/[0.02] dark:bg-white/[0.02] border-[#ded7ce] dark:border-white/10 text-[#8a7e72]"
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
