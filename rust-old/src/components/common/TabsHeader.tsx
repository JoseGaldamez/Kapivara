import { useProjectStore } from "@/stores/project.store";
import { projectController } from "@/controllers/project.controller";
import { Folder, Home, X } from "lucide-react";

export const TabsHeader = () => {
    const { tabs, activeTabId } = useProjectStore();

    return (
        <div className="flex items-center gap-1 overflow-y-hidden overflow-x-auto bg-gray-200 dark:bg-gray-900/90 p-1 h-10 select-none transition-colors">
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    onClick={() => projectController.selectTab(tab.id)}
                    className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-t-lg cursor-pointer text-sm min-w-[120px] max-w-[350px] border-b-2
                        ${activeTabId === tab.id
                            ? "bg-white dark:bg-gray-950 text-blue-600 dark:text-white border-blue-600 dark:border-blue-500 font-medium"
                            : "bg-gray-300 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-gray-800"}
                    `}
                >
                    <span className="truncate flex-1 flex items-center gap-2">
                        {tab.type === 'project' && <Folder size={14} />}
                        {tab.type === 'home' && <Home size={14} />}
                        {tab.title}</span> { /* TODO: Should I include an icon?  */}
                    {tab.closable && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                projectController.closeTab(tab.id);
                            }}
                            className="p-0.5 rounded-full hover:bg-gray-400/20 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};
