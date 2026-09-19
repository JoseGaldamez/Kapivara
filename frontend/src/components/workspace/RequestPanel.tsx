import { Collection, Environment, Project, RequestInfo, SavedResponse } from "@/types";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { requestController } from "@/controllers/request.controller";
import { useRequestStore } from "@/stores/request.store";
import { useProjectStore } from "@/stores/project.store";
import { useEnvironmentStore } from "@/stores/environment.store";
import { environmentController } from "@/controllers/environment.controller";
import { JsonViewer } from "./JsonViewer";
import { isMediaResponse, MediaResponseViewer } from "./MediaResponseViewer";
import { FormRequestSection } from "./FormRequestSection";
import { SavedResponsesPanel } from "./SavedResponsesPanel";
import { SaveResponseModal } from "../modals/SaveResponseModal";
import { ExpandedResponseModal } from "./ExpandedResponseModal";
import { SafeHtmlPreview } from "./SafeHtmlPreview";
import { isHtmlResponse } from "@/utils/html-preview";
import { AlertCircle, Info } from "lucide-react";
import { ResponseStatusBar } from "./ResponseStatusBar";
import { useRequestEditor } from "@/hooks/useRequestEditor";
import { useVerticalPanelResize } from "@/hooks/useVerticalPanelResize";
import { RequestPanelHeader } from "./RequestPanelHeader";

// Tabs
import {
    QueryParamsTab,
    AuthorizationTab,
    HeadersTab,
    BodyTab,
    Tabs
} from "./tabs";
import { toast } from "react-toastify";


interface RequestPanelProps {
    request: RequestInfo;
    project?: Project;
}

const EMPTY_ENVIRONMENTS: Environment[] = [];
const EMPTY_SAVED_RESPONSES: SavedResponse[] = [];
const EMPTY_COLLECTIONS: Collection[] = [];

export const RequestPanel = ({ request, project }: RequestPanelProps) => {
    const {
        method,
        url,
        body,
        bodyType,
        queryParams,
        headers,
        auth,
        updateMethod: handleMethodChange,
        updateUrl: handleUrlChange,
        updateBody: handleBodyChange,
        updateBodyType: handleBodyTypeChange,
        updateParams: handleUpdateParams,
        updateHeaders: handleUpdateHeaders,
        updateAuth: handleAuthChange,
    } = useRequestEditor(request);
    const activeTab = useRequestStore((state) =>
        state.activeTabByRequest[request.id] || state.lastActiveTab || "Body"
    );
    const setActiveTab = useCallback((tab: string) => {
        useRequestStore.getState().setActiveTabForRequest(request.id, tab);
    }, [request.id]);
    const [isLoading, setIsLoading] = useState(false);

    const {
        containerRef: panelRef,
        height: responseHeight,
        isDragging,
        startResizing: handleStartResizing,
    } = useVerticalPanelResize<HTMLDivElement>({
        initialHeight: 300,
        minHeight: 60,
        reservedHeight: 130,
        fallbackMaxHeight: 700,
    });
    const [isResponseCollapsed, setIsResponseCollapsed] = useState(false);
    const [resolvedVariables, setResolvedVariables] = useState<Record<string, string>>({});
    const [responseViewTab, setResponseViewTab] = useState<'response' | 'preview' | 'saved'>('response');
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isResponseExpanded, setIsResponseExpanded] = useState(false);
    const closeExpandedResponse = useCallback(() => setIsResponseExpanded(false), []);
    const [savedLoadStatus, setSavedLoadStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
    const savedLoadInFlight = useRef(false);

    const cachedSavedResponses = useRequestStore((state) => state.savedResponsesByRequest[request.id]);
    const savedResponses = cachedSavedResponses ?? EMPTY_SAVED_RESPONSES;
    const responseLoadStatus = useRequestStore((state) => state.requestResponseStatus[request.id]);
    const hasMediaResponse = request.response ? isMediaResponse(request.response) : false;
    const hasHtmlResponse = request.response ? isHtmlResponse(request.response) : false;
    const visibleResponseTab = hasMediaResponse && responseViewTab === 'preview' ? 'response' : responseViewTab;

    // Reset view tab whenever a new response arrives
    useEffect(() => {
        setResponseViewTab(hasHtmlResponse ? 'preview' : 'response');
        setIsResponseExpanded(false);
    }, [request.id, request.response?.status, request.response?.body, hasHtmlResponse]);

    const loadSavedResponses = useCallback(async () => {
        if (savedLoadInFlight.current) return;
        savedLoadInFlight.current = true;
        setSavedLoadStatus('loading');
        try {
            await requestController.getSavedResponses(request.id);
            setSavedLoadStatus('loaded');
        } catch {
            setSavedLoadStatus('error');
        } finally {
            savedLoadInFlight.current = false;
        }
    }, [request.id]);

    useEffect(() => {
        if (responseViewTab === 'saved' && cachedSavedResponses === undefined && savedLoadStatus === 'idle') {
            void loadSavedResponses();
        }
    }, [responseViewTab, cachedSavedResponses, savedLoadStatus, loadSavedResponses]);

    const projectEnvironments = useEnvironmentStore((state) => state.projectEnvironmentsByProject[request.project_id] ?? EMPTY_ENVIRONMENTS);
    const globalEnvironments = useEnvironmentStore((state) => state.globalEnvironments ?? EMPTY_ENVIRONMENTS);
    const activeProjectEnvironmentId = useEnvironmentStore((state) => state.activeProjectEnvironmentIdByProject[request.project_id] ?? null);
    const activeGlobalEnvironmentId = useEnvironmentStore((state) => state.activeGlobalEnvironmentId);
    const variableKeys = useMemo(() => Object.keys(resolvedVariables), [resolvedVariables]);


    useEffect(() => {
        environmentController.bootstrap(request.project_id);
    }, [request.project_id]);

    useEffect(() => {
        const syncVariables = async () => {
            const nextVariables = await environmentController.getResolvedVariables(request.project_id);
            setResolvedVariables(nextVariables);
        };
        syncVariables();
    }, [request.project_id, activeProjectEnvironmentId, activeGlobalEnvironmentId, projectEnvironments, globalEnvironments]);

    const handleSend = async () => {
        if (!url) return;

        // Check if url uses {{baseUrl}} and baseUrl is empty or undefined
        if (url.includes("{{baseUrl}}")) {
            const baseUrlVal = resolvedVariables["baseUrl"];
            if (!baseUrlVal || !baseUrlVal.trim()) {
                toast.warning("baseUrl is not defined for this project's active environment");
                return;
            }
        }

        setIsLoading(true);
        try {
            // Allow controller to use the passed request object but with current UI values
            const reqToSend = {
                ...request,
                method,
                url: url,
                params: JSON.stringify(queryParams),
                headers: JSON.stringify(headers),
                body,
                body_type: bodyType,
                auth: JSON.stringify(auth)
            };

            await requestController.executeRequest(reqToSend);
        } catch (error) {
            console.error("Request failed handled in UI:", error);
            // Removed toast.error to let the UI pseudo-response explain the issue
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = useCallback(async () => {
        try {
            await requestController.updateRequest(request.id, request.project_id, {
                url,
                method,
                body,
                body_type: bodyType,
                params: JSON.stringify(queryParams),
                headers: JSON.stringify(headers),
                auth: JSON.stringify(auth)
            });
            toast.success("Request saved");
        } catch {
            toast.error("Request could not be saved");
        }
    }, [request.id, request.project_id, url, method, body, bodyType, queryParams, headers, auth]);

    const handleSaveResponse = async (name: string) => {
        if (!request.response) return;
        try {
            await requestController.saveCurrentResponse(request.id, name, request.response);
            toast.success('Response saved');
        } catch {
            toast.error('Failed to save response');
        }
    };

    const handleDeleteSavedResponse = async (id: string) => {
        try {
            await requestController.deleteSavedResponse(request.id, id);
            toast.success('Saved response deleted');
        } catch {
            toast.error('Failed to delete saved response');
        }
    };



    const storeProject = useProjectStore((state) =>
        state.projects.find((p) => p.uid === request.project_id)
    );
    const projectName = project?.name || storeProject?.name || "Project";

    const collections = useRequestStore((state) => state.collectionsByProject?.[request.project_id] ?? EMPTY_COLLECTIONS);

    // Resolve folder hierarchy if request is inside a collection ("folder si hay")
    const folderPath = useMemo(() => {
        if (!request.collection_id) return [];
        const path: string[] = [];
        let currentId: string | null | undefined = request.collection_id;
        const visited = new Set<string>();
        while (currentId && !visited.has(currentId)) {
            visited.add(currentId);
            const col = collections.find((collection) => collection.id === currentId);
            if (!col) break;
            path.unshift(col.name);
            currentId = col.parent_id;
        }
        return path;
    }, [collections, request.collection_id]);

    // Keyboard shortcuts Ctrl + S to save
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave]);

    return (
        <div ref={panelRef} className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#ded7ce] bg-[#fffdf9] shadow-xs transition-colors dark:border-white/8 dark:bg-[#18191e]">

            <RequestPanelHeader
                request={request}
                method={method}
                url={url}
                projectName={projectName}
                folderPath={folderPath}
                onSave={handleSave}
            />

            <FormRequestSection
                method={method}
                url={url}
                isLoading={isLoading}
                handleSend={handleSend}
                handleMethodChange={handleMethodChange}
                handleUrlChange={handleUrlChange}
                variableKeys={variableKeys}
                variablePreview={resolvedVariables}
                projectId={request.project_id}
                projectEnvironments={projectEnvironments}
                globalEnvironments={globalEnvironments}
                activeProjectEnvironmentId={activeProjectEnvironmentId}
                activeGlobalEnvironmentId={activeGlobalEnvironmentId}
                onVariableAdded={async () => {
                    await environmentController.bootstrap(request.project_id);
                    const nextVariables = await environmentController.getResolvedVariables(request.project_id);
                    setResolvedVariables(nextVariables);
                }}
            />

            <div className="flex-1 min-h-0 flex overflow-hidden">
                <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                    <Tabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        paramsCount={queryParams.filter(p => p.key || p.value).length}
                        headersCount={headers.filter(h => h.key || h.value).length}
                    />

                    <div className="flex-1 p-4 overflow-y-auto">
                        {activeTab === "Query Params" && <QueryParamsTab params={queryParams} onUpdate={handleUpdateParams} variableKeys={variableKeys} variablePreview={resolvedVariables} />}
                        {activeTab === "Authorization" && <AuthorizationTab auth={auth} onUpdate={handleAuthChange} variableKeys={variableKeys} variablePreview={resolvedVariables} />}
                        {activeTab === "Headers" && <HeadersTab headers={headers} onUpdate={handleUpdateHeaders} variableKeys={variableKeys} variablePreview={resolvedVariables} />}
                        {activeTab === "Body" && <BodyTab
                            body={body}
                            setBody={handleBodyChange}
                            bodyType={bodyType}
                            setBodyType={handleBodyTypeChange}
                            variableKeys={variableKeys}
                            variablePreview={resolvedVariables}
                        />}
                    </div>
                </div>
            </div>

            {/* Resizer */}
            {!isResponseCollapsed ? (
                <div
                    className={`w-full h-[2px] bg-[#ded7ce]/70 dark:bg-white/8 cushioned-resizer-ns select-none transition-colors ${isDragging ? "bg-[#0066ff]" : "hover:bg-[#0066ff]/60"}`}
                    onMouseDown={handleStartResizing}
                >
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 z-20 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
                        <span className="w-1 h-1 rounded-full bg-[#8a7e72]" />
                        <span className="w-1 h-1 rounded-full bg-[#8a7e72]" />
                        <span className="w-1 h-1 rounded-full bg-[#8a7e72]" />
                    </div>
                </div>
            ) : null}

            <div style={{ height: isResponseCollapsed ? 42 : responseHeight }} className="shrink-0 flex flex-col bg-[#fffdf9] dark:bg-[#15161c] border-t border-[#ded7ce]/60 dark:border-white/8">
                <ResponseStatusBar
                    request={request}
                    isCollapsed={isResponseCollapsed}
                    onToggleCollapse={() => setIsResponseCollapsed((prev) => !prev)}
                    onSaveResponse={request.response ? () => setIsSaveModalOpen(true) : undefined}
                    onExpandResponse={request.response ? () => setIsResponseExpanded(true) : undefined}
                />

                {!isResponseCollapsed ? <div className="flex-1 flex flex-col min-h-0 relative">
                    {request.response ? (
                        request.response.status === 0 ? (
                            <div className="flex-1 overflow-auto p-4">
                                <div className="flex h-full items-start justify-center p-8">
                                    <div className="max-w-3xl w-full flex flex-col gap-6">
                                        <div className="flex items-start gap-4">
                                            <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                                <AlertCircle size={24} />
                                            </div>
                                            <div className="pt-1">
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Could not send request</h3>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    The application was unable to get a response from the server.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pl-16 space-y-6">
                                            <div className="w-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-5">
                                                <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2">
                                                    <Info size={18} />
                                                    Suggestions to fix this issue:
                                                </h4>
                                                <ul className="list-disc pl-5 space-y-2 text-sm text-orange-700 dark:text-orange-400">
                                                    <li>Make sure the endpoint is a valid URL and the server is currently running.</li>
                                                    <li>Check if you typed the address correctly (e.g., <code className="bg-orange-100 dark:bg-orange-900/50 px-1 rounded">http://</code> vs <code className="bg-orange-100 dark:bg-orange-900/50 px-1 rounded">https://</code>).</li>
                                                    <li>Verify that your network connection is active.</li>
                                                    <li>If you are running a local dev server, ensure it is listening on the expected port.</li>
                                                    <li>Check for CORS issues or firewall blocking the connection.</li>
                                                </ul>
                                            </div>
                                            <div className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 font-mono text-xs text-red-500 dark:text-red-400 break-words whitespace-pre-wrap">
                                                <strong>Error Details: </strong>
                                                {request.response.body}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ── Normal response: tab bar + content ── */
                            <>
                                {/* Segmented capsule response tabs */}
                                <div className="flex items-center p-0.5 bg-black/[0.04] dark:bg-white/[0.05] rounded-xl my-2 mx-4 gap-0.5 self-start border border-[#ded7ce]/60 dark:border-white/5">
                                    {(['response', ...(!hasMediaResponse ? ['preview' as const] : []), 'saved'] as const).map((tab) => {
                                        const isActive = visibleResponseTab === tab;
                                        return (
                                            <button
                                                key={tab}
                                                onClick={() => setResponseViewTab(tab)}
                                                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                                                    isActive
                                                        ? 'bg-white dark:bg-[#20222a] text-[#0066ff] dark:text-blue-400 shadow-2xs border border-[#ded7ce]/60 dark:border-white/10'
                                                        : 'text-[#766b61] dark:text-[#9e9488] hover:text-[#1a1714] dark:hover:text-[#f4eadf]'
                                                }`}
                                            >
                                                {tab === 'saved' ? `Saved${savedResponses.length > 0 ? ` (${savedResponses.length})` : ''}` : tab === 'response' ? 'Response' : 'Preview'}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-h-0 px-4 pb-4 flex flex-col">
                                    {visibleResponseTab === 'response' ? (
                                        hasMediaResponse ? (
                                            !isResponseExpanded && <MediaResponseViewer response={request.response} />
                                        ) : (
                                            <div className="h-full rounded-xl border border-[#ded7ce] dark:border-white/8 bg-[#f6f2ec] dark:bg-[#121316] overflow-auto shadow-2xs">
                                                <JsonViewer data={request.response.body} />
                                            </div>
                                        )
                                    ) : visibleResponseTab === 'preview' ? (
                                        <div className="h-full rounded-xl border border-[#ded7ce] dark:border-white/8 overflow-hidden bg-white shadow-2xs">
                                            <SafeHtmlPreview response={request.response} title="Response Preview" />
                                        </div>
                                    ) : (
                                        <div className="h-full rounded-xl border border-[#ded7ce] dark:border-white/8 bg-[#fffdf9] dark:bg-[#18191e] overflow-auto shadow-2xs">
                                            {cachedSavedResponses === undefined && savedLoadStatus === 'error' ? (
                                                <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-[#8a7e72] dark:text-[#a89f91]">
                                                    <p>Could not load saved responses.</p>
                                                    <button type="button" onClick={() => void loadSavedResponses()} className="font-semibold text-[#0066ff] hover:underline">Retry</button>
                                                </div>
                                            ) : cachedSavedResponses === undefined ? (
                                                <div role="status" aria-label="Loading saved responses" className="space-y-2 p-4 motion-safe:animate-pulse">
                                                    {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-9 rounded-lg bg-[#f6f2ec] dark:bg-white/[0.05]" />)}
                                                </div>
                                            ) : (
                                                <SavedResponsesPanel responses={savedResponses} onDelete={handleDeleteSavedResponse} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )
                    ) : responseLoadStatus === 'error' ? (
                        <div className="h-full flex flex-col items-center justify-center gap-2 text-sm text-[#8a7e72] dark:text-[#a89f91]">
                            <p>Could not load the saved response.</p>
                            <button type="button" onClick={() => void requestController.loadStoredResponse(request.project_id, request.id)} className="font-semibold text-[#0066ff] hover:underline">Retry</button>
                        </div>
                    ) : responseLoadStatus !== 'loaded' ? (
                        <div role="status" aria-label="Loading saved response" className="h-full px-4 py-5 motion-safe:animate-pulse">
                            <div className="mb-4 h-6 w-44 rounded bg-[#e5ded6] dark:bg-white/10" />
                            <div className="h-[calc(100%-2.5rem)] rounded-xl bg-[#f6f2ec] dark:bg-white/[0.04]" />
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                            <p>Send a request to see the response</p>
                        </div>
                    )}
                </div> : null}
            </div>

            <SaveResponseModal
                isOpen={isSaveModalOpen}
                defaultName={`${request.name} - ${new Date().toLocaleTimeString()}`}
                onClose={() => setIsSaveModalOpen(false)}
                onConfirm={handleSaveResponse}
            />

            {isResponseExpanded && request.response && (
                <ExpandedResponseModal
                    response={request.response}
                    requestName={request.name}
                    initialView={visibleResponseTab === 'preview' ? 'preview' : 'response'}
                    onClose={closeExpandedResponse}
                />
            )}


        </div>
    );
};
