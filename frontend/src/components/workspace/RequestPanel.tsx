import { RequestInfo, RequestParam, RequestHeader, Project } from "@/types";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { requestController } from "@/controllers/request.controller";
import { useRequestStore } from "@/stores/request.store";
import { useProjectStore } from "@/stores/project.store";
import { useEnvironmentStore } from "@/stores/environment.store";
import { environmentController } from "@/controllers/environment.controller";
import { JsonViewer } from "./JsonViewer";
import { FormRequestSection } from "./FormRequestSection";
import { SavedResponsesPanel } from "./SavedResponsesPanel";
import { SaveResponseModal } from "../modals/SaveResponseModal";
import { Edit2, AlertCircle, Info, Save } from "lucide-react";
import { ResponseStatusBar } from "./ResponseStatusBar";
import { getRequestDisplayName } from "@/utils/request-name.util";

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

const EMPTY_ENVIRONMENTS: any[] = [];
const EMPTY_SAVED_RESPONSES: any[] = [];
const EMPTY_COLLECTIONS: any[] = [];

export const RequestPanel = ({ request, project }: RequestPanelProps) => {
    const [method, setMethod] = useState(request.method || "GET");
    const [url, setUrl] = useState(request.url || "");
    const activeTab = useRequestStore((state) =>
        state.activeTabByRequest[request.id] || state.lastActiveTab || "Body"
    );
    const setActiveTab = useCallback((tab: string) => {
        useRequestStore.getState().setActiveTabForRequest(request.id, tab);
    }, [request.id]);
    const [isLoading, setIsLoading] = useState(false);

    // Title editing state
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(request.name || "");
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
        if (!request.auth) return { auth_type: 'none' };
        try {
            return typeof request.auth === 'string' ? JSON.parse(request.auth) : request.auth;
        } catch {
            return { auth_type: 'none' };
        }
    });

    const [responseHeight, setResponseHeight] = useState(300);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ startY: number; startHeight: number }>({ startY: 0, startHeight: 300 });
    const panelRef = useRef<HTMLDivElement>(null);
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
        environmentController.bootstrap(request.project_id);
    }, [request.project_id]);

    useEffect(() => {
        const syncVariables = async () => {
            const nextVariables = await environmentController.getResolvedVariables(request.project_id);
            setResolvedVariables(nextVariables);
        };
        syncVariables();
    }, [request.project_id, activeProjectEnvironmentId, activeGlobalEnvironmentId, projectEnvironments, globalEnvironments]);

    useEffect(() => {
        setMethod(request.method || "GET");
        setUrl(request.url || "");
        setBody(request.body || "");
        setBodyType(request.body_type || "none");
        setTitle(request.name || "");

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

        if (!request.auth) {
            setAuth({ auth_type: 'none' });
        } else {
            try {
                setAuth(typeof request.auth === 'string' ? JSON.parse(request.auth) : request.auth);
            } catch {
                setAuth({ auth_type: 'none' });
            }
        }
    }, [request.id]);

    // Handle resizing without jumping
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const deltaY = dragStartRef.current.startY - e.clientY;
            const maxAllowed = panelRef.current ? panelRef.current.clientHeight - 130 : 700;
            const newHeight = Math.max(60, Math.min(maxAllowed, dragStartRef.current.startHeight + deltaY));
            setResponseHeight(newHeight);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'row-resize';
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [isDragging]);

    const handleStartResizing = (e: React.MouseEvent) => {
        e.preventDefault();
        window.getSelection()?.removeAllRanges();
        dragStartRef.current = {
            startY: e.clientY,
            startHeight: responseHeight
        };
        setIsDragging(true);
    };

    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditingTitle]);

    const displayName = getRequestDisplayName({
        name: request.name,
        method,
        url
    });

    const handleTitleSave = async () => {
        const trimmed = title.trim();
        if (trimmed !== (request.name || "")) {
            await requestController.updateRequest(request.id, request.project_id, { name: trimmed });
            toast.success(trimmed ? "Request renamed" : "Request name reset to default");
        }
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleTitleSave();
        } else if (e.key === "Escape") {
            setTitle(request.name || "");
            setIsEditingTitle(false);
        }
    };

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
            const col = collections.find((c: any) => c.id === currentId);
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

            {/* Request Path Header */}
            <div className="flex items-center justify-between border-b border-[#ded7ce]/60 dark:border-white/8 px-4 py-2.5 bg-[#fbf8f4]/80 dark:bg-[#17181d]/80 min-h-[40px]">
                <div className="flex items-center gap-1.5 text-xs text-[#5f554e] dark:text-[#a89f91] min-w-0 flex-1">
                    {/* Project Name */}
                    <span className="font-medium text-[#7a695d] dark:text-[#918a84] shrink-0" title={`Project: ${projectName}`}>
                        {projectName}
                    </span>

                    {/* Folders (if any) */}
                    {folderPath.map((folderName, index) => (
                        <span key={index} className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[#a89c92] dark:text-[#5f5b57]">/</span>
                            <span className="font-medium text-[#5f554e] dark:text-[#a89f91] max-w-[150px] truncate" title={`Folder: ${folderName}`}>
                                {folderName}
                            </span>
                        </span>
                    ))}

                    {/* Separator before Request Name */}
                    <span className="text-[#a89c92] dark:text-[#5f5b57] shrink-0">/</span>

                    {/* Editable Request Name */}
                    {isEditingTitle ? (
                        <div className="flex items-center gap-1.5 min-w-0 flex-1 max-w-sm">
                            <input
                                ref={titleInputRef}
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={handleTitleKeyDown}
                                placeholder={displayName}
                                className="w-full text-xs font-semibold text-[#1a1714] dark:text-[#f4eadf] bg-white dark:bg-[#202126] border border-[#0066ff] rounded px-2 py-0.5 focus:outline-none shadow-2xs"
                            />
                        </div>
                    ) : (
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                setTitle(request.name || displayName);
                                setIsEditingTitle(true);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    setTitle(request.name || displayName);
                                    setIsEditingTitle(true);
                                }
                            }}
                            className="group flex items-center gap-1.5 min-w-0 cursor-pointer rounded px-1.5 py-0.5 -mx-1.5 hover:bg-black/5 dark:hover:bg-white/8 transition-colors"
                            title="Click to rename request"
                        >
                            <span className="font-semibold text-[#1a1714] dark:text-[#f4eadf] truncate">
                                {displayName}
                            </span>
                            <Edit2 size={11} className="text-[#8a7e72] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            {request.is_dirty && (
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" title="Draft / Unsaved changes" />
                            )}
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <button
                    type="button"
                    onClick={handleSave}
                    title="Save Request (Ctrl+S)"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border shadow-2xs active:scale-95 shrink-0 ${
                        request.is_dirty
                            ? "border-[#0066ff]/40 bg-[#0066ff]/10 text-[#0066ff] hover:bg-[#0066ff]/20 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-400"
                            : "border-[#ded7ce] dark:border-white/10 bg-white dark:bg-[#20222a] hover:bg-[#f6f2ec] dark:hover:bg-[#262833] text-[#5f554e] dark:text-[#a89f91] hover:text-[#1a1714] dark:hover:text-[#f4eadf]"
                    }`}
                >
                    <Save size={13} className={request.is_dirty ? "text-[#0066ff] dark:text-blue-400" : "text-[#5f554e] dark:text-[#a89f91]"} />
                    <span>Save</span>
                    {request.is_dirty && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    )}
                </button>
            </div>

            <FormRequestSection
                method={method}
                url={url}
                isLoading={isLoading}
                handleSend={handleSend}
                handleMethodChange={handleMethodChange}
                handleUrlChange={handleUrlChange}
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
                <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                    <Tabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        paramsCount={queryParams.filter(p => p.key || p.value).length}
                        headersCount={headers.filter(h => h.key || h.value).length}
                    />

                    <div className="flex-1 p-4 overflow-y-auto">
                        {activeTab === "Query Params" && <QueryParamsTab params={queryParams} onUpdate={handleUpdateParams} variableKeys={Object.keys(resolvedVariables)} variablePreview={resolvedVariables} />}
                        {activeTab === "Authorization" && <AuthorizationTab auth={auth} onUpdate={handleAuthChange} variableKeys={Object.keys(resolvedVariables)} variablePreview={resolvedVariables} />}
                        {activeTab === "Headers" && <HeadersTab headers={headers} onUpdate={handleUpdateHeaders} variableKeys={Object.keys(resolvedVariables)} variablePreview={resolvedVariables} />}
                        {activeTab === "Body" && <BodyTab
                            body={body}
                            setBody={handleBodyChange}
                            bodyType={bodyType}
                            setBodyType={handleBodyTypeChange}
                            variableKeys={Object.keys(resolvedVariables)}
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
                                    {(['response', 'preview', 'saved'] as const).map((tab) => {
                                        const isActive = responseViewTab === tab;
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
                                    {responseViewTab === 'response' ? (
                                        <div className="h-full rounded-xl border border-[#ded7ce] dark:border-white/8 bg-[#f6f2ec] dark:bg-[#121316] overflow-auto shadow-2xs">
                                            <JsonViewer data={request.response.body} />
                                        </div>
                                    ) : responseViewTab === 'preview' ? (
                                        <div className="h-full rounded-xl border border-[#ded7ce] dark:border-white/8 overflow-hidden bg-white shadow-2xs">
                                            <iframe
                                                key={request.response.body?.slice(0, 40)}
                                                srcDoc={request.response.body ?? ''}
                                                sandbox="allow-same-origin allow-scripts"
                                                className="w-full h-full border-0 bg-white"
                                                title="Response Preview"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-full rounded-xl border border-[#ded7ce] dark:border-white/8 bg-[#fffdf9] dark:bg-[#18191e] overflow-auto shadow-2xs">
                                            <SavedResponsesPanel
                                                responses={savedResponses}
                                                onDelete={handleDeleteSavedResponse}
                                            />
                                        </div>
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
