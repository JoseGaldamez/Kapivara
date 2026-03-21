import { RequestInfo, RequestParam, RequestHeader } from "@/types";
import { useState, useEffect, useRef } from "react";
import { requestController } from "@/controllers/request.controller";
import { useRequestStore } from "@/stores/request.store";
import { JsonViewer } from "./JsonViewer";
import { FormRequestSection } from "./FormRequestSection";
import { toast } from "react-toastify";
import { Edit2, AlertCircle, Info } from "lucide-react";
import { ResponseStatusBar } from "./ResponseStatusBar";

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
    }, [request]);

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
        // 1. Separate Base URL and Query String
        const [baseUrl, queryString] = newUrl.split('?');

        // 2. Parse Query String to Params
        let newParams: RequestParam[] = [];
        if (queryString) {
            const pairs = queryString.split('&');
            newParams = pairs.map(pair => {
                const [key, value] = pair.split('=');
                // Try to find existing param to preserve description/ID
                const existing = queryParams.find(p => p.key === key && p.value === (value || ''));
                return {
                    id: existing?.id || crypto.randomUUID(),
                    request_id: request.id,
                    key: key || '',
                    value: value || '',
                    description: existing?.description || '',
                    is_active: 1
                };
            });
        }

        // 3. Update State
        setUrl(baseUrl || newUrl); // Keep original if no query string yet? 
        // Logic check: If I type "http://api.com?foo=bar", baseUrl is "http://api.com".
        // If I type "http://api.com", baseUrl is "http://api.com", queryString is undefined.
        // But `url` state in RequestPanel seems to be "base url" only based on `url + getQueries()`.
        // Wait, if I type in the input, `newUrl` is the full string.
        // The Input value is `url + getQueries()`.
        // If I change it, I get the full new string.
        // So I should set `url` to just the base part.

        setUrl(baseUrl);
        setQueryParams(newParams);

        // 4. Update Store
        useRequestStore.getState().updateRequest({
            id: request.id,
            project_id: request.project_id,
            url: baseUrl,
            params: JSON.stringify(newParams),
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

    const handleSave = async () => {
        await requestController.updateRequest(request.id, request.project_id, {
            url: url,
            method: method,
            body: body,
            body_type: bodyType,
            params: JSON.stringify(queryParams),
            headers: JSON.stringify(headers),
            auth: JSON.stringify(auth)
        });
        toast.success("Request saved");
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
            <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                {isEditingTitle ? (
                    <input
                        ref={titleInputRef}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleSave}
                        onKeyDown={handleTitleKeyDown}
                        className="text-xl font-bold bg-transparent border-b-2 border-[#0E61B1] focus:outline-none text-gray-800 dark:text-gray-100 min-w-[300px]"
                    />
                ) : (
                    <div className="group flex items-center gap-3 cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                        <button className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-[#0E61B1] transition-all">
                            <Edit2 size={18} />
                        </button>
                    </div>
                )}
            </div>

            <FormRequestSection
                method={method}
                url={url + getQueries()}
                isLoading={isLoading}
                handleSend={handleSend}
                handleSave={handleSave}
                handleMethodChange={handleMethodChange}
                handleUrlChange={handleUrlChange}
                isDirty={request.is_dirty}
            />

            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 p-4 overflow-y-auto">
                {activeTab === "Query Params" && <QueryParamsTab params={queryParams} onUpdate={handleUpdateParams} />}
                {activeTab === "Authorization" && <AuthorizationTab auth={auth} onUpdate={handleAuthChange} />}
                {activeTab === "Headers" && <HeadersTab headers={headers} onUpdate={handleUpdateHeaders} />}
                {activeTab === "Body" && <BodyTab
                    body={body}
                    setBody={handleBodyChange}
                    bodyType={bodyType}
                    setBodyType={handleBodyTypeChange}
                />}
                {activeTab === "Settings" && <SettingsTab />}
            </div>

            {/* Resizer */}
            <div
                className={`w-full h-1 bg-gray-200 dark:bg-gray-700 cursor-ns-resize hover:bg-blue-500 transition-colors ${isDragging ? "bg-blue-500" : ""}`}
                onMouseDown={() => setIsDragging(true)}
            />

            <div style={{ height: responseHeight }} className="shrink-0 flex flex-col bg-gray-50 dark:bg-[#0d1117] border-t border-gray-200 dark:border-gray-800">
                <ResponseStatusBar request={request} />

                <div className="flex-1 overflow-auto p-4 relative">
                    {request.response ? (
                        request.response.status === 0 ? (
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
                        ) : (
                            <JsonViewer data={request.response.body} />
                        )
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                            <p>Send a request to see the response</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
