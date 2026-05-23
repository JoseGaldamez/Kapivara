import { useState, useEffect, useRef } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { GripVertical, Trash2, MoreVertical, Edit2 } from "lucide-react";
import { RequestInfo } from "@/types";
import { requestController } from "@/controllers/request.controller";

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
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(req.name);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync input name when request name changes
    useEffect(() => {
        if (!isEditing) {
            setEditName(req.name);
        }
    }, [req.name, isEditing]);

    // Focus and select text when editing starts
    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleSaveRename = async () => {
        const trimmed = editName.trim();
        if (trimmed && trimmed !== req.name) {
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
            setEditName(req.name);
            setIsEditing(false);
        }
    };

    const handleStartRename = (e: React.MouseEvent) => {
        e.stopPropagation();
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
                        className="w-full px-1.5 py-0.5 text-xs text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    />
                ) : (
                    <div className="flex items-center gap-2 truncate w-full">{req.name}</div>
                )}
                <div className="flex flex-row items-center gap-1 shrink-0">
                    {req.is_dirty ? <div className="bg-orange-500 w-2 h-2 rounded-full" /> : null}
                    
                    {/* Options Dropdown Menu */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="opacity-0 group-hover/req:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer p-0.5"
                            title="Options"
                        >
                            <MoreVertical size={13} className="pointer-events-none" />
                        </button>
                        {isMenuOpen && (
                            <div
                                ref={menuRef}
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-1 z-[60] w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-xl p-1 animate-in fade-in slide-in-from-top-1 duration-150"
                            >
                                <button
                                    onClick={handleStartRename}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 cursor-pointer transition-colors"
                                >
                                    <Edit2 size={12} className="text-gray-400" />
                                    <span>Rename</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteRequest(req);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors"
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
                        className="opacity-0 group-hover/req:opacity-100 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <GripVertical size={14} className="pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
};
