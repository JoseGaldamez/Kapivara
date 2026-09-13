import { Plus, Search, FilePlus, FolderPlus, Braces } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDismissibleLayer } from "@/hooks/useDismissibleLayer";

interface SidebarHeaderProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onNewRequest: () => void;
    onNewFolder: () => void;
    onImportCurl: () => void;
}

export const SidebarHeader = ({
    searchTerm,
    onSearchChange,
    onNewRequest,
    onNewFolder,
    onImportCurl,
}: SidebarHeaderProps) => {
    const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const plusMenuRef = useDismissibleLayer<HTMLDivElement>({
        isOpen: isPlusMenuOpen,
        onDismiss: () => setIsPlusMenuOpen(false),
    });

    // Keyboard shortcut to focus search: Ctrl+F / Cmd+F
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
                e.preventDefault();
                searchInputRef.current?.focus();
                searchInputRef.current?.select();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

    return (
        <div className="p-3.5 pb-2.5 border-b border-[#ded7ce]/70 dark:border-white/8 space-y-2.5">
            {/* Top row: Title and + action button */}
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#1a1714] dark:text-[#f4eadf] tracking-tight">
                    Collections
                </h2>
                <div className="flex items-center">
                    {/* Add Menu */}
                    <div className="relative" ref={plusMenuRef}>
                        <button
                            onClick={() => setIsPlusMenuOpen((prev) => !prev)}
                            className="p-1 rounded-md text-[#5f554e] hover:text-[#1a1714] hover:bg-black/5 dark:text-[#a89f91] dark:hover:text-[#f4eadf] dark:hover:bg-white/10 transition-colors cursor-pointer"
                            title="New item"
                        >
                            <Plus size={15} />
                        </button>
                        {isPlusMenuOpen && (
                            <div className="absolute right-0 mt-1 z-50 w-44 bg-[#fffdf9] dark:bg-[#1c1d24] border border-[#ded7ce] dark:border-white/10 rounded-xl shadow-lg p-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                <button
                                    onClick={() => {
                                        setIsPlusMenuOpen(false);
                                        onNewRequest();
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#1a1714] dark:text-[#f4eadf] hover:bg-[#f6f2ec] dark:hover:bg-white/10 transition-colors text-left cursor-pointer"
                                >
                                    <FilePlus size={13} className="text-[#8a7e72]" />
                                    <span>New Request</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setIsPlusMenuOpen(false);
                                        onImportCurl();
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#1a1714] dark:text-[#f4eadf] hover:bg-[#f6f2ec] dark:hover:bg-white/10 transition-colors text-left cursor-pointer"
                                >
                                    <Braces size={13} className="text-[#8a7e72]" />
                                    <span>Import cURL</span>
                                </button>
                                <div
                                    role="separator"
                                    className="mx-2 my-1 border-t border-[#ded7ce]/80 dark:border-white/10"
                                />
                                <button
                                    onClick={() => {
                                        setIsPlusMenuOpen(false);
                                        onNewFolder();
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#1a1714] dark:text-[#f4eadf] hover:bg-[#f6f2ec] dark:hover:bg-white/10 transition-colors text-left cursor-pointer"
                                >
                                    <FolderPlus size={13} className="text-[#8a7e72]" />
                                    <span>New Folder</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Second row: Search input */}
            <div className="relative flex items-center bg-[#f7f3ee] dark:bg-[#121316] border border-[#ded7ce]/80 dark:border-white/8 rounded-lg px-2.5 py-1.5 transition-colors focus-within:border-[#0066ff] focus-within:bg-white dark:focus-within:bg-[#121316]">
                <Search size={14} className="text-[#8a7e72] dark:text-[#6e665d] shrink-0 mr-2" />
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-transparent text-xs text-[#1a1714] dark:text-[#f4eadf] placeholder:text-[#8a7e72] dark:placeholder:text-[#6e665d] focus:outline-none"
                />
                <span className="shrink-0 text-[10px] font-mono text-[#8a7e72] dark:text-[#6e665d] bg-black/5 dark:bg-white/10 rounded px-1.5 py-0.5 ml-1 border border-black/5 dark:border-white/5 select-none pointer-events-none">
                    {isMac ? "⌘ F" : "Ctrl F"}
                </span>
            </div>
        </div>
    );
};
