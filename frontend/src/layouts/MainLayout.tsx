import { AppSection, AppSidebar } from "@/components/common/AppSidebar";
import { TopBar } from "@/components/common/TopBar";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { projectController } from "@/controllers/project.controller";
import { EnvironmentsPage } from "@/pages/Environments/EnvironmentsPage";
import { HistoryPage } from "@/pages/History/HistoryPage";
import { HomePage } from "@/pages/HomePage/HomePage";
import { ProjectSettingsPage } from "@/pages/ProjectSettings/ProjectSettingsPage";
import { Settings } from "@/pages/Settings/Settings";
import { Workspace } from "@/pages/Workspace/Workspace";
import { useProjectStore } from "@/stores/project.store";
import { useState } from "react";

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
                        activeSection === "history" ? (
                            <HistoryPage
                                key={activeProject.uid}
                                project={activeProject}
                                searchTerm={searchTerm}
                                onNavigateToRequests={() => setActiveSection("requests")}
                            />
                        ) : activeSection === "environments" ? (
                            <EnvironmentsPage
                                key={activeProject.uid}
                                project={activeProject}
                                onNavigateToRequests={() => setActiveSection("requests")}
                            />
                        ) : activeSection === "settings" ? (
                            <ProjectSettingsPage
                                key={activeProject.uid}
                                project={activeProject}
                                onNavigateToRequests={() => setActiveSection("requests")}
                                onNavigateToEnvironments={() => setActiveSection("environments")}
                            />
                        ) : (
                            <Workspace key={activeProject.uid} project={activeProject} />
                        )
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
            {isSettingsOpen && <Settings onClose={() => setIsSettingsOpen(false)} />}
        </div>
    );
};
