const TABS = ["Body", "Params", "Authorization", "Headers", "Settings"];

interface TabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const Tabs = ({ activeTab, setActiveTab }: TabsProps) => {
    return (
        <div className="flex items-center px-4 border-b border-gray-200 gap-6 overflow-x-auto">
            {TABS.map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                        ? "border-[#0E61B1] text-[#0E61B1]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    )
}
