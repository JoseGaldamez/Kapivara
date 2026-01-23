import { Sidebar } from "@/components/workspace/Sidebar";
import { RequestPanel } from "@/components/workspace/RequestPanel";
import { Project } from "@/types";
import { useMemo } from "react";
import { useRequestStore } from "@/stores/request.store";

interface WorkspaceProps {
    project: Project;
}

const EMPTY_ARRAY: RequestInfo[] = [];

export const Workspace = ({ project }: WorkspaceProps) => {
    // Select the live request object from the store
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
                {activeRequest ? (
                    <RequestPanel key={activeRequest.id} request={activeRequest} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                        Select a request to start
                    </div>
                )}
            </div>
        </div>
    )
}
