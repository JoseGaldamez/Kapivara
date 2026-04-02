import { useDraggable, useDroppable } from "@dnd-kit/core";
import { GripVertical, Trash2 } from "lucide-react";
import { RequestInfo } from "@/types";

interface DraggableRequestItemProps {
    req: RequestInfo;
    onSelectRequest: (req: RequestInfo) => void;
    getRequestSelected: (req: RequestInfo) => string;
    getMethodColor: (method: string) => string;
    indent: boolean;
    onDeleteRequest: (req: RequestInfo) => void;
}

export const DraggableRequestItem = ({
    req,
    onSelectRequest,
    getRequestSelected,
    getMethodColor,
    indent,
    onDeleteRequest,
}: DraggableRequestItemProps) => {
    const { attributes, listeners, setNodeRef: setDragNodeRef, isDragging } = useDraggable({
        id: `request-${req.id}`,
        data: { type: "Request", request: req },
    });

    const { setNodeRef: setDropNodeRef, isOver } = useDroppable({
        id: `drop-request-${req.id}`,
        data: { type: "RequestTarget", collectionId: req.collection_id },
    });

    // Merge refs so this element is both draggable and a drop proxy
    const setNodeRef = (node: HTMLElement | null) => {
        setDragNodeRef(node);
        setDropNodeRef(node);
    };

    // When DragOverlay is used, the original element must NOT move (no transform).
    // Only reduce opacity so the "source slot" stays visible as a placeholder.
    // The DragOverlay ghost handles all visual movement.
    const style: React.CSSProperties | undefined = isDragging
        ? { opacity: 0.3 }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onSelectRequest(req)}
            className={`group/req flex items-center gap-2 p-1.5 ${indent ? "pl-7" : ""} rounded-lg ${
                isOver
                    ? "bg-blue-100 dark:bg-blue-900/40 border border-blue-400"
                    : "hover:bg-gray-200 dark:hover:bg-gray-800"
            } cursor-pointer text-sm text-gray-700 dark:text-gray-300 select-none ${getRequestSelected(req)}`}
        >
            <span className={`text-[10px] font-bold w-8 shrink-0 ${getMethodColor(req.method)}`}>
                {req.method}
            </span>
            <div className="flex items-center justify-between flex-1 min-w-0">
                <div className="flex items-center gap-2 truncate w-full">{req.name}</div>
                <div className="flex flex-row items-center gap-1 shrink-0">
                    {req.is_dirty ? <div className="bg-orange-500 w-2 h-2 rounded-full" /> : null}
                    <button
                        onClick={(e) => { e.stopPropagation(); onDeleteRequest(req); }}
                        className="opacity-0 group-hover/req:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete request"
                    >
                        <Trash2 size={13} className="pointer-events-none" />
                    </button>
                    <div
                        {...listeners}
                        {...attributes}
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover/req:opacity-100 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <GripVertical size={14} className="pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
};
