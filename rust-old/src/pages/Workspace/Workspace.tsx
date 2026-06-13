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
        <div className="flex h-full p-2 gap-2 bg-[#F5F5F7] dark:bg-[#0D0D11] transition-colors overflow-hidden">
            <Sidebar
                projectId={project.uid}
                activeRequestId={activeRequestId}
                onSelectRequest={(req) => setActiveRequest(project.uid, req.id)}
            />
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
                <div className="flex-1 min-h-0 overflow-hidden">
                    {activeRequest ? (
                        <RequestPanel key={activeRequest.id} request={activeRequest} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm bg-white dark:bg-[#16161E] rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm">
                            Select a request to get started
                        </div>
                    )}
                </div>
                <RequestConsole />
            </div>
        </div>
    );
};
