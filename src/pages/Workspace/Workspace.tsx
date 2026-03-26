import { Sidebar } from "@/components/workspace/Sidebar";
import { RequestPanel } from "@/components/workspace/RequestPanel";
import { RequestConsole } from "@/components/workspace/RequestConsole";
import { SettingsTab } from "@/components/workspace/tabs";
import { Project, RequestInfo } from "@/types";
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
                <div className="flex-1 min-h-0 overflow-hidden">
                    {activeRequest ? (
                        <RequestPanel key={activeRequest.id} request={activeRequest} />
                    ) : (
                        <div className="flex-1 flex flex-col overflow-y-auto h-full">
                            <div className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                                Select a request to start — or manage your environments below
                            </div>
                            <div className="px-4 pb-6">
                                <SettingsTab projectId={project.uid} />
                            </div>
                        </div>
                    )}
                </div>
                <RequestConsole />
            </div>
        </div>
    )
}
