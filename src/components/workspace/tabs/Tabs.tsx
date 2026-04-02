import { ReactNode } from "react";

const TABS = ["Body", "Query Params", "Authorization", "Headers"];

interface TabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    rightSlot?: ReactNode;
}

export const Tabs = ({ activeTab, setActiveTab, rightSlot }: TabsProps) => {
    return (
        <div className="flex items-stretch border-b border-gray-200 dark:border-gray-800">
            <div className="flex-1 min-w-0 overflow-x-auto px-4">
                <div className="flex items-center gap-6 w-max min-w-full">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                                ? "border-[#0E61B1] text-[#0E61B1] dark:text-blue-400 dark:border-blue-400"
                                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            {rightSlot ? <div className="shrink-0 border-l border-gray-200 dark:border-gray-800">{rightSlot}</div> : null}
        </div>
    )
}
