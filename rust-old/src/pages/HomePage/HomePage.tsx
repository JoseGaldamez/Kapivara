import { ContainerListProjects } from "@/components/home/ContainerListProjects"
import { TopBar } from "../../components/common/TopBar"
import { useState } from "react"
import { Settings } from "@/pages/Settings/Settings"
import { INFORMATION } from "@/utils/information.constant"

export const HomePage = () => {

    const [searchFilter, setSearchFilter] = useState("")
    const [isOpenSettings, setIsOpenSettings] = useState(false);

    return (
        <div className="h-screen bg-[#e4e8f1b7] dark:bg-gray-900/70 transition-colors">
            <TopBar
                onOpenSettings={() => setIsOpenSettings(true)}
                searchTerm={searchFilter}
                onSearchChange={setSearchFilter}
            />

            <ContainerListProjects searchFilter={searchFilter} />

            <div className="fixed bottom-0 left-0 right-0 h-8 text-xs bg-blue-500 dark:bg-blue-900 text-white flex items-center justify-between px-4">
                <span>
                    Still in development
                </span>
                <span>
                    {INFORMATION.name} Beta v{INFORMATION.version} | {INFORMATION.year}
                </span>
            </div>

            {isOpenSettings && <Settings onClose={() => setIsOpenSettings(false)} />}
        </div>
    )
}
