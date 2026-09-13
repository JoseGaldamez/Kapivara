import { ReactNode } from "react";

const TAB_ITEMS = [
    { id: "Query Params", label: "Params" },
    { id: "Headers", label: "Headers" },
    { id: "Authorization", label: "Auth" },
    { id: "Body", label: "Body" },
];

interface TabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    paramsCount?: number;
    headersCount?: number;
    rightSlot?: ReactNode;
}

export const Tabs = ({ activeTab, setActiveTab, paramsCount, headersCount, rightSlot }: TabsProps) => {
    return (
        <div className="flex items-stretch border-b border-[#ded7ce]/60 dark:border-white/8 px-4">
            <div className="flex-1 min-w-0 overflow-x-auto">
                <div className="flex items-center gap-6 w-max min-w-full">
                    {TAB_ITEMS.map((tab) => {
                        const count =
                            tab.id === "Query Params" ? paramsCount : tab.id === "Headers" ? headersCount : undefined;
                        const labelWithCount =
                            count !== undefined && count > 0 ? `${tab.label} (${count})` : tab.label;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                                    isActive
                                        ? "border-[#0066ff] text-[#0066ff] dark:text-blue-400 dark:border-blue-400"
                                        : "border-transparent text-[#766b61] dark:text-[#9e9488] hover:text-[#1a1714] dark:hover:text-[#f4eadf]"
                                }`}
                            >
                                {labelWithCount}
                            </button>
                        );
                    })}
                </div>
            </div>
            {rightSlot ? <div className="shrink-0 border-l border-[#ded7ce]/60 dark:border-white/8">{rightSlot}</div> : null}
        </div>
    );
};
