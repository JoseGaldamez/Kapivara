import { RequestInfo, RequestParam } from "@/types";
import { useState, useEffect } from "react";
import { requestController } from "@/controllers/request.controller";
import { useRequestStore } from "@/stores/request.store";
import { JsonViewer } from "./JsonViewer";
import { FormRequestSection } from "./FormRequestSection";
import { toast } from "react-toastify";
import { QueryParamsTab } from "./tabs/QueryParamsTab/QueryParamsTab";
import { AuthorizationTab } from "./tabs/AuthorizationTab";
import { HeadersTab } from "./tabs/HeadersTab";
import { BodyTab } from "./tabs/BodyTab/BodyTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { Tabs } from "./tabs/Tabs";
import { ResponseStatusBar } from "./ResponseStatusBar";

interface RequestPanelProps {
    request: RequestInfo;
}

export const RequestPanel = ({ request }: RequestPanelProps) => {
    const [method, setMethod] = useState(request.method || "GET");
    const [url, setUrl] = useState(request.url || "");
    const [activeTab, setActiveTab] = useState("Body");
    const [isLoading, setIsLoading] = useState(false);

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

    const getQueries = () => {
        if (!queryParams || queryParams.length === 0) return "";
        const queries = queryParams
            .filter(p => p.is_active === 1 && p.key)
            .map(p => `${p.key}=${p.value}`)
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
        
        try {
            const parsedParams =  typeof request.params === 'string' ? JSON.parse(request.params) : (request.params || []);
            setQueryParams(parsedParams);
        } catch {
            setQueryParams([]);
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

    const handleSend = async () => {
        if (!url) return;
        setIsLoading(true);
        try {
            // Allow controller to use the passed request object but with current UI values
            const reqToSend = { ...request, method, url: url, params: getQueries(), body, body_type: bodyType };
            await requestController.executeRequest(reqToSend);
        } catch (error) {
            console.error(error);
            toast.error("Error sending request");
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

    const handleSave = async () => {
        await requestController.updateRequest(request.id, request.project_id, {
            url: url,
            method: method,
            body: body,
            body_type: bodyType,
            params: JSON.stringify(queryParams)
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
                {activeTab === "Authorization" && <AuthorizationTab />}
                {activeTab === "Headers" && <HeadersTab />}
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
                        <JsonViewer
                            data={request.response.body}
                        />
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
