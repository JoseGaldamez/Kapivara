import { AppSection, AppSidebar } from "@/components/common/AppSidebar";
import { TopBar } from "@/components/common/TopBar";
import { ProjectContent } from "@/components/layout/ProjectContent";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { projectController } from "@/controllers/project.controller";
import { HomePage } from "@/pages/HomePage/HomePage";
import { useProjectStore } from "@/stores/project.store";
import { lazy, Suspense, useState } from "react";

const Settings = lazy(() => import("@/pages/Settings/Settings").then((module) => ({ default: module.Settings })));

export const MainLayout = () => {
    const projects = useProjectStore((state) => state.projects);
    const activeProjectId = useProjectStore((state) => state.activeProjectId);
    const activeProject = projects.find((project) => project.uid === activeProjectId) ?? null;
    const [activeSection, setActiveSection] = useState<AppSection>("requests");
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-[#f4eadf] dark:bg-[#101115]">
            <TopBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenCreateProject={() => setIsCreateProjectOpen(true)}
                onProjectSelected={() => setActiveSection("requests")}
            />
            <div className="relative z-0 flex min-h-0 flex-1">
                {activeProject && (
                    <AppSidebar
                        activeSection={activeSection}
                        hasProject={true}
                        onNavigate={setActiveSection}
                    />
                )}
                <div className="relative min-w-0 flex-1 overflow-hidden">
                    {activeProject ? (
                        <ProjectContent
                            activeSection={activeSection}
                            project={activeProject}
                            searchTerm={searchTerm}
                            onNavigate={setActiveSection}
                        />
                    ) : (
                        <HomePage searchFilter={searchTerm} onCreateProject={() => setIsCreateProjectOpen(true)} />
                    )}
                </div>
            </div>

            <CreateProjectModal
                isOpen={isCreateProjectOpen}
                onClose={() => setIsCreateProjectOpen(false)}
                onCreated={(project) => {
                    projectController.openProject(project);
                    setActiveSection("requests");
                }}
            />
            {isSettingsOpen ? (
                <Suspense fallback={null}>
                    <Settings onClose={() => setIsSettingsOpen(false)} />
                </Suspense>
            ) : null}
        </div>
    );
};
