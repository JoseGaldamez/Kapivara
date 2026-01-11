import { TabsHeader } from "@/components/common/TabsHeader";
import { HomePage } from "@/pages/HomePage/HomePage";
import { Workspace } from "@/pages/Workspace/Workspace";
import { useProjectStore } from "@/stores/project.store";
import { Project } from "@/types";

export const MainLayout = () => {
    const { activeTabId, projects } = useProjectStore();
    const activeTab = useProjectStore((state) =>
        state.tabs.find((t) => t.id === activeTabId)
    );

    const getActiveProject = (): Project | null => {
        if (activeTab?.type === 'project' && activeTab.projectId) {
            return projects.find(p => p.uid === activeTab.projectId) || null;
        }
        return null;
    };

    const project = getActiveProject();

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <TabsHeader />
            <div className="flex-1 overflow-hidden relative">
                <div
                    className="absolute inset-0 bg-[#e4e8f1b7]"
                    style={{ visibility: activeTabId === 'home' ? 'visible' : 'hidden' }}
                >
                    <HomePage />
                </div>

                {activeTab?.type === 'project' && project && (
                    <div className="absolute inset-0 bg-white">
                        <Workspace key={project.uid} project={project} />
                    </div>
                )}
            </div>
        </div>
    );
};
