import { Sidebar } from "@/components/workspace/Sidebar";
import { RequestPanel } from "@/components/workspace/RequestPanel";
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
        <div className="flex h-full p-3 gap-3 bg-[#f4eadf] dark:bg-[#101115] transition-colors overflow-hidden">
            <Sidebar
                projectId={project.uid}
                activeRequestId={activeRequestId}
                onSelectRequest={(req) => setActiveRequest(project.uid, req.id)}
            />
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
                {activeRequest ? (
                    <RequestPanel key={activeRequest.id} request={activeRequest} project={project} />
                ) : (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-[#ded7ce] bg-[#fffdf9] text-sm text-[#8a7e72] shadow-xs dark:border-white/8 dark:bg-[#18191e] dark:text-[#a89f91]">
                        Select a request to get started
                    </div>
                )}
            </div>
        </div>
    );
};
