import { ContainerListProjects } from "@/components/home/ContainerListProjects"
import { TopBar } from "../../components/common/TopBar"

export const HomePage = () => {
    return (
        <div>
            <TopBar />
            <ContainerListProjects />
        </div>
    )
}
