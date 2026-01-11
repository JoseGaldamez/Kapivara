import { RequestInfo } from "@/types";
import { METHODS_COLORS } from "@/utils/methods.constants";
import { Play, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { requestController } from "@/controllers/request.controller";
import { JsonViewer } from "./JsonViewer";

interface RequestPanelProps {
    request: RequestInfo;
}

const METHODS = Object.keys(METHODS_COLORS);
const TABS = ["Params", "Authorization", "Headers", "Body", "Settings"];

export const RequestPanel = ({ request }: RequestPanelProps) => {
    const [method, setMethod] = useState(request.method || "GET");
    const [url, setUrl] = useState(request.url || "");
    const [activeTab, setActiveTab] = useState("Params");
    const [isLoading, setIsLoading] = useState(false);
    // Removed local response state in favor of request.response

    // Resize state
    const [responseHeight, setResponseHeight] = useState(300);
    const [isDragging, setIsDragging] = useState(false);

    // Update local state when request prop changes
    useEffect(() => {
        setMethod(request.method || "GET");
        setUrl(request.url || "");
        // No need to clear response manually as it switches with the request prop
    }, [request]);

    // Handle resizing
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            // Calculate new height based on mouse position
            // We want the distance from bottom of screen to mouse y
            const newHeight = window.innerHeight - e.clientY;
            // Clamp height
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
            // We pass the current local url/method state to ensure we send what's typed
            // but we use the ID from the request prop.
            // Ideally we should sync local state to store before sending, but passing args works for execution.
            // Let's update the controller to accept overrides or update store first.

            // Allow controller to use the passed request object but with current UI values
            const reqToSend = { ...request, method, url };
            await requestController.executeRequest(reqToSend);
        } catch (error) {
            console.error(error);
            // Handle error visualization (e.g. toast)
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
            method: method
        });
        // TODO: Add toast notification
        console.log("Request saved");
    };

    const getMethodColor = (m: string) => {
        return METHODS_COLORS[m as keyof typeof METHODS_COLORS];
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Top Bar: Method, URL, Send */}
            <div className="p-4 border-b border-gray-200 flex gap-2">
                <div className="flex-1 flex items-center bg-gray-100 rounded-lg p-1 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
                    <select
                        value={method}
                        onChange={(e) => handleMethodChange(e.target.value)}
                        className={`bg-transparent font-bold text-sm px-3 py-1.5 focus:outline-none cursor-pointer ${getMethodColor(method)}`}
                    >
                        {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <div className="w-px h-6 bg-gray-300 mx-2"></div>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter request URL"
                        className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder:text-gray-400"
                    />
                </div>
                <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="bg-[#0E61B1] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#0E61B1]/90 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Play size={16} fill="currentColor" /> {isLoading ? "Sending..." : "Send"}
                </button>
                <button
                    onClick={handleSave}
                    className="text-gray-500 p-2 hover:bg-gray-100 rounded-lg hover:text-[#0E61B1] transition-colors"
                    title="Save Request"
                >
                    <Save size={20} />
                </button>
            </div>

            {/* Config Tabs */}
            <div className="flex items-center px-4 border-b border-gray-200 gap-6 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                            ? "border-[#0E61B1] text-[#0E61B1]"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="text-gray-500 text-sm italic p-4 border border-dashed border-gray-300 rounded-lg text-center">
                    Content for <strong>{activeTab}</strong> tab will be here.
                </div>
            </div>

            {/* Resizer Handle */}
            <div
                onMouseDown={() => setIsDragging(true)}
                className={`h-1 cursor-row-resize bg-gray-200 hover:bg-[#0E61B1] transition-colors ${isDragging ? 'bg-[#0E61B1]' : ''}`}
            />

            {/* Response Area */}
            <div
                style={{ height: responseHeight }}
                className="border-t border-gray-200 bg-gray-50 flex flex-col"
            >
                <div className="p-2 border-b border-gray-200 flex justify-between items-center px-4 bg-white/50 backdrop-blur-sm">
                    <span className="text-xs font-bold text-gray-500 uppercase">Response</span>
                    {request.response && (
                        <div className="flex gap-4 text-xs font-mono">
                            <span className={`font-bold ${request.response.status >= 200 && request.response.status < 300 ? 'text-green-600' : 'text-red-500'}`}>
                                Status: {request.response.status} {request.response.status_text}
                            </span>
                            <span className="text-gray-500">Time: {request.response.time_ms}ms</span>
                        </div>
                    )}
                </div>
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
