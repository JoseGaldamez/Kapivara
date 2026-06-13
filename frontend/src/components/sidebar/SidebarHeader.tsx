import { FilePlus, FolderPlus, Search } from "lucide-react";

interface SidebarHeaderProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onNewRequest: () => void;
    onNewFolder: () => void;
}

export const SidebarHeader = ({
    searchTerm,
    onSearchChange,
    onNewRequest,
    onNewFolder,
}: SidebarHeaderProps) => {
    return (
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex gap-2 mb-2 mr-2">
                <button
                    onClick={onNewRequest}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#0E61B1] text-white py-1.5 rounded-lg text-xs font-medium hover:bg-[#0E61B1]/90"
                >
                    <FilePlus size={14} /> New Request
                </button>
                <button
                    onClick={onNewFolder}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
                    title="New Folder"
                >
                    <FolderPlus size={16} />
                </button>
            </div>
            <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Filter..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-[#0E61B1] dark:text-gray-200"
                />
            </div>
        </div>
    );
};
