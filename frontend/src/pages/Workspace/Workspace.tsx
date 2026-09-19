import { Sidebar } from "@/components/workspace/Sidebar";
import { RequestPanel } from "@/components/workspace/RequestPanel";
import { Project, RequestInfo } from "@/types";
import { useEffect, useMemo } from "react";
import { useRequestStore } from "@/stores/request.store";
import { requestController } from "@/controllers/request.controller";

interface WorkspaceProps {
    project: Project;
}

const EMPTY_ARRAY: RequestInfo[] = [];

export const Workspace = ({ project }: WorkspaceProps) => {
    const requests = useRequestStore((state) => state.requestsByProject[project.uid] ?? EMPTY_ARRAY);
    const activeRequestId = useRequestStore((state) => state.activeRequestIdByProject[project.uid] || null);
    const setActiveRequest = useRequestStore((state) => state.setActiveRequest);
    const projectLoadStatus = useRequestStore((state) => state.projectLoadStatus[project.uid]);
    const detailStatus = useRequestStore((state) => activeRequestId ? state.requestDetailStatus[activeRequestId] : undefined);
    const responseStatus = useRequestStore((state) => activeRequestId ? state.requestResponseStatus[activeRequestId] : undefined);

    const activeRequest = useMemo(() =>
        requests.find(r => r.id === activeRequestId) || null
    , [requests, activeRequestId]);

    useEffect(() => {
        if (activeRequest && !detailStatus) void requestController.loadRequestDetails(project.uid, activeRequest.id);
    }, [activeRequest?.id, detailStatus, project.uid]);

    useEffect(() => {
        if (activeRequest && detailStatus === 'loaded' && !responseStatus) {
            void requestController.loadStoredResponse(project.uid, activeRequest.id);
        }
    }, [activeRequest?.id, detailStatus, responseStatus, project.uid]);

    return (
        <div className="flex h-full p-3 gap-3 bg-[#f4eadf] dark:bg-[#101115] transition-colors overflow-hidden">
            <Sidebar
                projectId={project.uid}
                activeRequestId={activeRequestId}
                onSelectRequest={(req) => setActiveRequest(project.uid, req.id)}
            />
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
                {activeRequest && detailStatus === 'loaded' ? (
                    <RequestPanel key={activeRequest.id} request={activeRequest} project={project} />
                ) : activeRequest && detailStatus === 'error' ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-[#ded7ce] bg-[#fffdf9] text-sm text-[#8a7e72] dark:border-white/8 dark:bg-[#18191e] dark:text-[#a89f91]">
                        <p>Could not load this request.</p>
                        <button type="button" onClick={() => void requestController.loadRequestDetails(project.uid, activeRequest.id)} className="font-semibold text-[#0066ff] hover:underline">Retry</button>
                    </div>
                ) : activeRequest || !projectLoadStatus || projectLoadStatus === 'loading' ? (
                    <div role="status" aria-label="Loading request" className="h-full rounded-2xl border border-[#ded7ce] bg-[#fffdf9] p-6 motion-safe:animate-pulse dark:border-white/8 dark:bg-[#18191e]">
                        <div className="mb-8 h-5 w-48 rounded bg-[#e5ded6] dark:bg-white/10" />
                        <div className="mb-5 h-10 w-full rounded-lg bg-[#eee8e0] dark:bg-white/[0.06]" />
                        <div className="mb-4 h-4 w-56 rounded bg-[#eee8e0] dark:bg-white/[0.06]" />
                        <div className="h-32 w-full rounded-lg bg-[#f6f2ec] dark:bg-white/[0.04]" />
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-[#ded7ce] bg-[#fffdf9] text-sm text-[#8a7e72] shadow-xs dark:border-white/8 dark:bg-[#18191e] dark:text-[#a89f91]">
                        Select a request to get started
                    </div>
                )}
            </div>
        </div>
    );
};
