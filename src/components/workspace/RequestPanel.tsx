import { RequestInfo, RequestParam, RequestHeader } from "@/types";
import { useState, useEffect, useRef, useCallback } from "react";
import { requestController } from "@/controllers/request.controller";
import { useRequestStore } from "@/stores/request.store";
import { useEnvironmentStore } from "@/stores/environment.store";
import { environmentController } from "@/controllers/environment.controller";
import { JsonViewer } from "./JsonViewer";
import { FormRequestSection } from "./FormRequestSection";
import { SavedResponsesPanel } from "./SavedResponsesPanel";
import { SaveResponseModal } from "@/components/modals";
import { toast } from "react-toastify";
import { Edit2, AlertCircle, Info, PanelsRightBottom, PanelsTopLeft } from "lucide-react";
import { ResponseStatusBar } from "./ResponseStatusBar";
import { Select } from "@/components/common/Select";

// Tabs
import {
    QueryParamsTab,
    AuthorizationTab,
    HeadersTab,
    BodyTab,
    SettingsTab,
    Tabs
} from "./tabs";


interface RequestPanelProps {
    request: RequestInfo;
}

const EMPTY_ENVIRONMENTS: any[] = [];
const EMPTY_SAVED_RESPONSES: any[] = [];

export const RequestPanel = ({ request }: RequestPanelProps) => {
    const [method, setMethod] = useState(request.method || "GET");
    const [url, setUrl] = useState(request.url || "");
    const [activeTab, setActiveTab] = useState("Body");
    const [isLoading, setIsLoading] = useState(false);

    // Title editing state
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(request.name || "Untitled Request");
    const titleInputRef = useRef<HTMLInputElement>(null);

    // Resize state
    const [body, setBody] = useState(request.body || "");
    const [bodyType, setBodyType] = useState(request.body_type || "none");
    const [queryParams, setQueryParams] = useState<RequestParam[]>(() => {
        if (!request.params) return [];
        try {
            return typeof request.params === 'string' ? JSON.parse(request.params) : request.params;
        } catch {
            return [];
        }
    });

    const [headers, setHeaders] = useState<RequestHeader[]>(() => {
        if (!request.headers) return [];
        try {
            return typeof request.headers === 'string' ? JSON.parse(request.headers) : request.headers;
        } catch {
            return [];
        }
    });

    const [auth, setAuth] = useState<any>(() => {
        try {
            return request.auth ? JSON.parse(request.auth) : { auth_type: 'none' };
        } catch {
            return { auth_type: 'none' };
        }
    });

    const getQueries = () => {
        if (!queryParams || queryParams.length === 0) return "";
        const queries = queryParams
            .filter(p => p.is_active === 1 && p.key)
            .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
            .join('&');
        return queries ? `?${queries}` : "";
    };


    const [responseHeight, setResponseHeight] = useState(300);
    const [isDragging, setIsDragging] = useState(false);
    const [isEnvironmentPanelVisible, setIsEnvironmentPanelVisible] = useState(false);
    const [isResponseCollapsed, setIsResponseCollapsed] = useState(false);
    const [resolvedVariables, setResolvedVariables] = useState<Record<string, string>>({});
    const [responseViewTab, setResponseViewTab] = useState<'response' | 'preview' | 'saved'>('response');
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const savedResponses = useRequestStore((state) => state.savedResponsesByRequest[request.id] ?? EMPTY_SAVED_RESPONSES);

    // Reset view tab whenever a new response arrives
    useEffect(() => {
        setResponseViewTab('response');
    }, [request.response?.status, request.response?.body]);

    useEffect(() => {
        requestController.getSavedResponses(request.id);
    }, [request.id]);

    const projectEnvironments = useEnvironmentStore((state) => state.projectEnvironmentsByProject[request.project_id] ?? EMPTY_ENVIRONMENTS);
    const globalEnvironments = useEnvironmentStore((state) => state.globalEnvironments ?? EMPTY_ENVIRONMENTS);
    const activeProjectEnvironmentId = useEnvironmentStore((state) => state.activeProjectEnvironmentIdByProject[request.project_id] ?? null);
    const activeGlobalEnvironmentId = useEnvironmentStore((state) => state.activeGlobalEnvironmentId);


    useEffect(() => {
        const loadEnvironments = async () => {
            await environmentController.bootstrap(request.project_id);
            const nextVariables = await environmentController.getResolvedVariables(request.project_id);
            setResolvedVariables(nextVariables);
        };

        loadEnvironments();
    }, [request.project_id]);

    useEffect(() => {
        const refreshVariables = async () => {
            await environmentController.loadProjectEnvironments(request.project_id);
            await environmentController.loadGlobalEnvironments();
            const nextVariables = await environmentController.getResolvedVariables(request.project_id);
            setResolvedVariables(nextVariables);
        };

        refreshVariables();
    }, [request.project_id, activeProjectEnvironmentId, activeGlobalEnvironmentId]);

    useEffect(() => {
        setMethod(request.method || "GET");
        setUrl(request.url || "");
        setBody(request.body || "");
        setBodyType(request.body_type || "none");
        setTitle(request.name || "Untitled Request");

        try {
            const parsedParams = typeof request.params === 'string' ? JSON.parse(request.params) : (request.params || []);
            setQueryParams(parsedParams);
        } catch {
            setQueryParams([]);
        }

        try {
            const parsedHeaders = typeof request.headers === 'string' ? JSON.parse(request.headers) : (request.headers || []);
            setHeaders(parsedHeaders);
        } catch {
            setHeaders([]);
        }

        try {
            setAuth(request.auth ? JSON.parse(request.auth) : { auth_type: 'none' });
        } catch {
            setAuth({ auth_type: 'none' });
        }
    }, [request.id]);

    // Handle resizing
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const newHeight = window.innerHeight - e.clientY;
            if (newHeight >= 100 && newHeight <= window.innerHeight - 200) {
                setResponseHeight(newHeight);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [isEditingTitle]);

    const handleTitleSave = async () => {
        if (title.trim() === "") {
            setTitle(request.name || "Untitled Request");
            setIsEditingTitle(false);
            return;
        }
        if (title !== request.name) {
            await requestController.updateRequest(request.id, request.project_id, { name: title });
            toast.success("Request renamed");
        }
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleTitleSave();
        } else if (e.key === "Escape") {
            setTitle(request.name || "Untitled Request");
            setIsEditingTitle(false);
        }
    };

    const handleSend = async () => {
        if (!url) return;
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

    const handleMethodChange = (newMethod: string) => {
        setMethod(newMethod);
        useRequestStore.getState().updateRequest({
            id: request.id,
            project_id: request.project_id,
            method: newMethod,
            is_dirty: true
        });
    };

    const handleUrlChange = (newUrl: string) => {
        const qIndex = newUrl.indexOf('?');
        if (qIndex === -1) {
            setUrl(newUrl);
        } else {
            const baseUrl = newUrl.slice(0, qIndex);
            const queryString = newUrl.slice(qIndex + 1);
            const newParams: RequestParam[] = queryString
                ? queryString.split('&').map(pair => {
                    const [key, value] = pair.split('=');
                    const existing = queryParams.find(p => p.key === key && p.value === (value || ''));
                    return {
                        id: existing?.id || crypto.randomUUID(),
                        request_id: request.id,
                        key: key || '',
                        value: value || '',
                        description: existing?.description || '',
                        is_active: 1
                    };
                })
                : [];
            setUrl(baseUrl);
            setQueryParams(newParams);
        }
        useRequestStore.getState().updateRequest({
            id: request.id,
            project_id: request.project_id,
            url: newUrl,
            is_dirty: true
        });
    };

    const handleBodyChange = (newBody: string) => {
        setBody(newBody);
        useRequestStore.getState().updateRequest({
            id: request.id,
            project_id: request.project_id,
            body: newBody,
            is_dirty: true
        });
    };

    const handleBodyTypeChange = (newType: any) => {
        setBodyType(newType);
        useRequestStore.getState().updateRequest({
            id: request.id,
            project_id: request.project_id,
            body_type: newType,
            is_dirty: true
        });
    };

    const handleUpdateParams = (newParams: RequestParam[]) => {
        setQueryParams(newParams);
        useRequestStore.getState().updateRequest({
            id: request.id,
            project_id: request.project_id,
            params: JSON.stringify(newParams),
            is_dirty: true
        });
    };

    const handleUpdateHeaders = (newHeaders: RequestHeader[]) => {
        setHeaders(newHeaders);
        useRequestStore.getState().updateRequest({
            id: request.id,
            project_id: request.project_id,
            headers: JSON.stringify(newHeaders),
            is_dirty: true
        });
    };

    const handleAuthChange = (newAuth: any) => {
        setAuth(newAuth);
        useRequestStore.getState().updateRequest({
            id: request.id,
            project_id: request.project_id,
            auth: JSON.stringify(newAuth),
            is_dirty: true
        });
    };

    const handleSave = useCallback(async () => {
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

    const handleProjectEnvironmentChange = async (value: string) => {
        const nextId = value === '__none__' ? null : value;
        await environmentController.setActiveEnvironment('project', nextId, request.project_id);
        await environmentController.loadProjectEnvironments(request.project_id);
        await environmentController.loadGlobalEnvironments();
        const nextVariables = await environmentController.getResolvedVariables(request.project_id);
        setResolvedVariables(nextVariables);
    };

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
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative transition-colors">

            {/* Editable Title Section */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-2 min-w-0">
                <div className="flex-1 min-w-0">
                {isEditingTitle ? (
                    <input
                        ref={titleInputRef}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleSave}
                        onKeyDown={handleTitleKeyDown}
                        className="w-full text-xl font-bold bg-transparent border-b-2 border-[#0E61B1] focus:outline-none text-gray-800 dark:text-gray-100"
                    />
                ) : (
                    <div className="group flex items-center gap-3 cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate" title={title}>{title}</h2>
                        <button className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-[#0E61B1] transition-all">
                            <Edit2 size={18} />
                        </button>
                    </div>
                )}
                </div>

                <div className="flex items-center gap-2 shrink-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1">
                    <div className="w-52">
                        <Select
                            value={activeProjectEnvironmentId || '__none__'}
                            onChange={handleProjectEnvironmentChange}
                            options={[
                                { value: '__none__', label: 'Env: None' },
                                ...projectEnvironments.map((environment) => ({
                                    value: environment.id,
                                    label: `Env: ${environment.name}`
                                }))
                            ]}
                            className="w-full"
                        />
                    </div>
                    <button
                        onClick={() => setIsEnvironmentPanelVisible((prev) => !prev)}
                        className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        title={isEnvironmentPanelVisible ? 'Ocultar panel de environments' : 'Mostrar panel de environments'}
                    >
                        {isEnvironmentPanelVisible ? <PanelsRightBottom size={16} /> : <PanelsTopLeft size={16} />}
                    </button>
                </div>
            </div>

            <FormRequestSection
                method={method}
                url={url}
                isLoading={isLoading}
                handleSend={handleSend}
                handleSave={handleSave}
                handleMethodChange={handleMethodChange}
                handleUrlChange={handleUrlChange}
                isDirty={request.is_dirty}
                variableKeys={Object.keys(resolvedVariables)}
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
                {isEnvironmentPanelVisible ? (
                    <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-gray-900/30">
                        <SettingsTab projectId={request.project_id} request={request} isFullscreen />
                    </div>
                ) : (
                    <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

                        <div className="flex-1 p-4 overflow-y-auto">
                            {activeTab === "Query Params" && <QueryParamsTab params={queryParams} onUpdate={handleUpdateParams} />}
                            {activeTab === "Authorization" && <AuthorizationTab auth={auth} onUpdate={handleAuthChange} />}
                            {activeTab === "Headers" && <HeadersTab headers={headers} onUpdate={handleUpdateHeaders} variableKeys={Object.keys(resolvedVariables)} variablePreview={resolvedVariables} />}
                            {activeTab === "Body" && <BodyTab
                                body={body}
                                setBody={handleBodyChange}
                                bodyType={bodyType}
                                setBodyType={handleBodyTypeChange}
                            />}
                        </div>
                    </div>
                )}
            </div>

            {/* Resizer */}
            {!isResponseCollapsed ? (
                <div
                    className={`w-full h-1 bg-gray-200 dark:bg-gray-700 cursor-ns-resize hover:bg-blue-500 transition-colors ${isDragging ? "bg-blue-500" : ""}`}
                    onMouseDown={() => setIsDragging(true)}
                />
            ) : null}

            <div style={{ height: isResponseCollapsed ? 40 : responseHeight }} className="shrink-0 flex flex-col bg-gray-50 dark:bg-[#0d1117] border-t border-gray-200 dark:border-gray-800">
                <ResponseStatusBar
                    request={request}
                    isCollapsed={isResponseCollapsed}
                    onToggleCollapse={() => setIsResponseCollapsed((prev) => !prev)}
                    onSaveResponse={request.response ? () => setIsSaveModalOpen(true) : undefined}
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
                                {/* Tab bar */}
                                <div className="flex items-center gap-1 px-4 pt-2 pb-0 shrink-0 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0d1117]">
                                    {(['response', 'preview', 'saved'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setResponseViewTab(tab)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-t capitalize transition-colors ${
                                                responseViewTab === tab
                                                    ? 'bg-white dark:bg-gray-900 text-[#0E61B1] border border-b-white dark:border-gray-700 dark:border-b-gray-900 -mb-px'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                            }`}
                                        >
                                            {tab === 'saved' ? `Saved${savedResponses.length > 0 ? ` (${savedResponses.length})` : ''}` : tab === 'response' ? 'Response' : 'Preview'}
                                        </button>
                                    ))}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-h-0 overflow-auto">
                                    {responseViewTab === 'response' ? (
                                        <div className="p-4 h-full">
                                            <JsonViewer data={request.response.body} />
                                        </div>
                                    ) : responseViewTab === 'preview' ? (
                                        <iframe
                                            key={request.response.body?.slice(0, 40)}
                                            srcDoc={request.response.body ?? ''}
                                            sandbox="allow-same-origin allow-scripts"
                                            className="w-full h-full border-0 bg-white"
                                            title="Response Preview"
                                        />
                                    ) : (
                                        <SavedResponsesPanel
                                            responses={savedResponses}
                                            onDelete={handleDeleteSavedResponse}
                                        />
                                    )}
                                </div>
                            </>
                        )
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
        </div>
    );
};
