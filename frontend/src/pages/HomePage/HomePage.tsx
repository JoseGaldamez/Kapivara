import { ContainerListProjects } from "@/components/home/ContainerListProjects";
import { INFORMATION } from "@/utils/information.constant";

interface HomePageProps {
    searchFilter: string;
    onCreateProject: () => void;
}

export const HomePage = ({ searchFilter, onCreateProject }: HomePageProps) => {
    return (
        <div className="home-shell h-full overflow-hidden bg-[#f4eadf] text-[#2e1b14] transition-colors dark:bg-[#101115] dark:text-[#f8eee5]">
            <ContainerListProjects searchFilter={searchFilter} onCreateProject={onCreateProject} />

            <div className="pointer-events-none absolute bottom-3 right-5 z-10 hidden items-center gap-2 text-[11px] font-semibold text-[#8b756a] xl:flex dark:text-[#8f8b86]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{INFORMATION.name} Beta · v{INFORMATION.version}</span>
            </div>
        </div>
    );
};
