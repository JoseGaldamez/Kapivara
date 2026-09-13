import type { AppSection } from "@/components/common/AppSidebar";
import type { Project } from "@/types";
import { lazy, Suspense } from "react";

const Workspace = lazy(() => import("@/pages/Workspace/Workspace").then((module) => ({ default: module.Workspace })));
const EnvironmentsPage = lazy(() => import("@/pages/Environments/EnvironmentsPage").then((module) => ({ default: module.EnvironmentsPage })));
const HistoryPage = lazy(() => import("@/pages/History/HistoryPage").then((module) => ({ default: module.HistoryPage })));
const ProjectSettingsPage = lazy(() => import("@/pages/ProjectSettings/ProjectSettingsPage").then((module) => ({ default: module.ProjectSettingsPage })));

interface ProjectContentProps {
    activeSection: AppSection;
    project: Project;
    searchTerm: string;
    onNavigate: (section: AppSection) => void;
}

const ProjectContentFallback = () => (
    <div className="flex h-full items-center justify-center text-sm text-[#766b63] dark:text-[#99918a]" role="status">
        Loading workspace…
    </div>
);

export const ProjectContent = ({ activeSection, project, searchTerm, onNavigate }: ProjectContentProps) => {
    let content: React.ReactNode;

    switch (activeSection) {
        case "history":
            content = <HistoryPage project={project} searchTerm={searchTerm} onNavigateToRequests={() => onNavigate("requests")} />;
            break;
        case "environments":
            content = <EnvironmentsPage project={project} onNavigateToRequests={() => onNavigate("requests")} />;
            break;
        case "settings":
            content = (
                <ProjectSettingsPage
                    project={project}
                    onNavigateToRequests={() => onNavigate("requests")}
                    onNavigateToEnvironments={() => onNavigate("environments")}
                />
            );
            break;
        default:
            content = <Workspace project={project} />;
    }

    return (
        <Suspense fallback={<ProjectContentFallback />}>
            <div key={`${project.uid}-${activeSection}`} className="h-full">
                {content}
            </div>
        </Suspense>
    );
};
