import { RequestInfo } from "@/types";
import { useState, useEffect } from "react";
import { requestController } from "@/controllers/request.controller";
import { JsonViewer } from "./JsonViewer";
import { FormRequestSection } from "./FormRequestSection";
import { toast } from "react-toastify";
import { ParamsTab } from "./tabs/ParamsTab";
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

    const [responseHeight, setResponseHeight] = useState(300);
    const [isDragging, setIsDragging] = useState(false);


    useEffect(() => {
        setMethod(request.method || "GET");
        setUrl(request.url || "");
        setBody(request.body || "");
        setBodyType(request.body_type || "none");
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
            const reqToSend = { ...request, method, url, body, body_type: bodyType };
            await requestController.executeRequest(reqToSend);
        } catch (error) {
            console.error(error);
            toast.error("Error sending request");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMethodChange = async (newMethod: string) => {
        setMethod(newMethod);
        await requestController.updateRequestMethod(request.id, request.project_id, newMethod);
    };

    const handleSave = async () => {
        await requestController.updateRequest(request.id, request.project_id, {
            url: url,
            method: method,
            body: body,
            body_type: bodyType
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
                url={url}
                isLoading={isLoading}
                handleSend={handleSend}
                handleSave={handleSave}
                handleMethodChange={handleMethodChange}
                handleUrlChange={setUrl}
            />

            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 p-4 overflow-y-auto">
                {activeTab === "Params" && <ParamsTab />}
                {activeTab === "Authorization" && <AuthorizationTab />}
                {activeTab === "Headers" && <HeadersTab />}
                {activeTab === "Body" && <BodyTab
                    body={body}
                    setBody={setBody}
                    bodyType={bodyType}
                    setBodyType={setBodyType}
                />}
                {activeTab === "Settings" && <SettingsTab />}
            </div>

            <div
                onMouseDown={() => setIsDragging(true)}
                className={`h-1 cursor-row-resize bg-gray-200 dark:bg-gray-800 hover:bg-[#0E61B1] transition-colors ${isDragging ? 'bg-[#0E61B1]' : ''}`}
            />


            <div
                style={{ height: responseHeight }}
                className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20 flex flex-col"
            >
                <ResponseStatusBar request={request} />
                <div className="flex-1 overflow-auto font-mono text-sm">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-gray-400">Processing...</div>
                    ) : request.response ? (
                        <JsonViewer data={request.response.body} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Hit Send to get a response
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
