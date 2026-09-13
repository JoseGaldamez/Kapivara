import { RequestInfo } from "@/types";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Edit2, GripVertical, MoreVertical, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { requestController } from "@/controllers/request.controller";
import { getRequestDisplayName } from "@/utils/request-name.util";
import { useDismissibleLayer } from "@/hooks/useDismissibleLayer";

interface DraggableRequestItemProps {
    req: RequestInfo;
    onSelectRequest: (req: RequestInfo) => void;
    onDeleteRequest: (req: RequestInfo) => void;
    getRequestSelected: (req: RequestInfo) => string;
    getMethodColor: (method: string) => string;
    indent?: boolean;
}

export const DraggableRequestItem = ({
    req,
    onSelectRequest,
    onDeleteRequest,
    getRequestSelected,
    getMethodColor,
    indent = false,
}: DraggableRequestItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(req.name || "");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuRef = useDismissibleLayer<HTMLDivElement>({
        isOpen: isMenuOpen,
        onDismiss: () => setIsMenuOpen(false),
    });
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync input name when request name changes
    useEffect(() => {
        if (!isEditing) {
            setEditName(req.name || "");
        }
    }, [req.name, isEditing]);

    // Focus and select text when editing starts
    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleSaveRename = async () => {
        const trimmed = editName.trim();
        if (trimmed !== (req.name || "")) {
            try {
                await requestController.updateRequest(req.id, req.project_id, { name: trimmed });
            } catch (error) {
                console.error("Failed to rename request:", error);
            }
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            handleSaveRename();
        } else if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            setEditName(req.name || "");
            setIsEditing(false);
        }
    };

    const handleStartRename = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditName(req.name || "");
        setIsEditing(true);
        setIsMenuOpen(false);
    };

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

    const isSelected = !!(req.id && getRequestSelected(req));
    const displayMethod = req.method === "DELETE" ? "DEL" : req.method;

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onSelectRequest(req)}
            className={`group/req flex items-center gap-2 px-2 py-1.5 ${indent ? "pl-6" : ""} rounded-lg transition-colors ${
                isOver
                    ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-400/60"
                    : isSelected
                    ? "bg-[#eaf3fe] dark:bg-blue-500/15 text-[#1e40af] dark:text-blue-200 font-medium"
                    : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-[#2e2924] dark:text-[#e4ded6]"
            } cursor-pointer text-xs select-none`}
        >
            <span className={`text-[11px] font-bold font-mono w-9 shrink-0 text-left ${getMethodColor(req.method)}`}>
                {displayMethod}
            </span>
            <div 
                className="flex items-center justify-between flex-1 min-w-0"
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                }}
            >
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSaveRename}
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => e.stopPropagation()}
                        placeholder={getRequestDisplayName(req)}
                        className="w-full px-1.5 py-0.5 text-xs text-[#1a1714] dark:text-[#f4eadf] bg-white dark:bg-[#121316] border border-[#0066ff] rounded focus:outline-none font-medium"
                    />
                ) : (
                    <span className="truncate flex-1 font-medium">{getRequestDisplayName(req)}</span>
                )}
                <div className="flex flex-row items-center gap-1 shrink-0 ml-1.5">
                    {req.is_dirty ? <div className="bg-amber-500 w-1.5 h-1.5 rounded-full shrink-0" title="Draft / Unsaved" /> : null}
                    
                    {/* Options Dropdown Menu (··· button visible on hover or when selected) */}
                    <div ref={menuRef} className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className={`${isSelected ? 'opacity-70 hover:opacity-100' : 'opacity-0 group-hover/req:opacity-100'} text-[#8a7e72] hover:text-[#1a1714] dark:text-[#a89f91] dark:hover:text-[#f4eadf] transition-opacity cursor-pointer p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10`}
                            title="Options"
                        >
                            <MoreVertical size={13} className="pointer-events-none" />
                        </button>
                        {isMenuOpen && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-1 z-[60] w-32 bg-[#fffdf9] dark:bg-[#1c1d24] border border-[#ded7ce] dark:border-white/10 rounded-xl shadow-xl p-1 animate-in fade-in slide-in-from-top-1 duration-150"
                            >
                                <button
                                    onClick={handleStartRename}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#1a1714] dark:text-[#f4eadf] hover:bg-[#f6f2ec] dark:hover:bg-white/10 cursor-pointer transition-colors"
                                >
                                    <Edit2 size={12} className="text-[#8a7e72]" />
                                    <span>Rename</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteRequest(req);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors"
                                >
                                    <Trash2 size={12} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div
                        {...listeners}
                        {...attributes}
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover/req:opacity-100 cursor-grab active:cursor-grabbing text-[#8a7e72] hover:text-[#1a1714] dark:text-[#a89f91] dark:hover:text-[#f4eadf] transition-opacity"
                    >
                        <GripVertical size={13} className="pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
};
