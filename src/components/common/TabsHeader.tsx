import { useProjectStore } from "@/stores/project.store";
import { projectController } from "@/controllers/project.controller";
import { X } from "lucide-react";

export const TabsHeader = () => {
    const { tabs, activeTabId } = useProjectStore();

    return (
        <div className="flex items-center gap-1 overflow-x-auto bg-gray-200 p-1 h-10 select-none">
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    onClick={() => projectController.selectTab(tab.id)}
                    className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-t-lg cursor-pointer text-sm min-w-[120px] max-w-[350px] border-b-2
                        ${activeTabId === tab.id
                            ? "bg-white text-blue-600 border-blue-600 font-medium"
                            : "bg-gray-300 text-gray-600 border-transparent hover:bg-gray-200"}
                    `}
                >
                    <span className="truncate flex-1">{tab.title}</span> { /* TODO: Should I include an icon?  */}
                    {tab.closable && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                projectController.closeTab(tab.id);
                            }}
                            className="p-0.5 rounded-full hover:bg-gray-400/20 text-gray-500 hover:text-red-500"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};
