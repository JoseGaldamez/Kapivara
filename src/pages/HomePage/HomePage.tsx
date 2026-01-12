import { ContainerListProjects } from "@/components/home/ContainerListProjects"
import { TopBar } from "../../components/common/TopBar"

export const HomePage = () => {
    return (
        <div className="h-screen">
            <TopBar />
            <ContainerListProjects />
            <div className="fixed bottom-0 left-0 right-0 h-8 text-xs bg-blue-500 text-white flex items-center justify-between px-4">
                <span>
                    Demo still in development
                </span>
                <span>
                    Kapivara v0.0.1 | 2026
                </span>
            </div>
        </div>
    )
}
