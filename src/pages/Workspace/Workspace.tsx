import { Sidebar } from "@/components/workspace/Sidebar";
import { RequestPanel } from "@/components/workspace/RequestPanel";
import { RequestConsole } from "@/components/workspace/RequestConsole";
import { Project, RequestInfo } from "@/types";
import { useMemo } from "react";
import { useRequestStore } from "@/stores/request.store";

interface WorkspaceProps {
    project: Project;
}

const EMPTY_ARRAY: RequestInfo[] = [];

export const Workspace = ({ project }: WorkspaceProps) => {
    const requests = useRequestStore((state) => state.requestsByProject[project.uid] ?? EMPTY_ARRAY);
    const activeRequestId = useRequestStore((state) => state.activeRequestIdByProject[project.uid] || null);
    const setActiveRequest = useRequestStore((state) => state.setActiveRequest);

    const activeRequest = useMemo(() =>
        requests.find(r => r.id === activeRequestId) || null
    , [requests, activeRequestId]);

    return (
        <div className="flex h-full">
            <Sidebar
                projectId={project.uid}
                activeRequestId={activeRequestId}
                onSelectRequest={(req) => setActiveRequest(project.uid, req.id)}
            />
            <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col h-full overflow-hidden transition-colors">
                <div className="flex-1 min-h-0 overflow-hidden">
                    {activeRequest ? (
                        <RequestPanel key={activeRequest.id} request={activeRequest} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                            Select a request to get started
                        </div>
                    )}
                </div>
                <RequestConsole />
            </div>
        </div>
    );
};
