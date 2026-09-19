import { RequestInfo } from "@/types";
import { Copy, Check, ChevronsDown, ChevronsUp, Bookmark, Maximize2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { isMediaResponse } from "./MediaResponseViewer";

interface ResponseStatusBarProps {
    request: RequestInfo;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    onSaveResponse?: () => void;
    onExpandResponse?: () => void;
}

const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const ResponseStatusBar = ({
    request,
    isCollapsed = false,
    onToggleCollapse,
    onSaveResponse,
    onExpandResponse,
}: ResponseStatusBarProps) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyResponse = () => {
        if (!request.response?.body) return;

        let textToCopy = request.response.body;
        try {
            const parsed = JSON.parse(textToCopy);
            textToCopy = JSON.stringify(parsed, null, 2);
        } catch {
            // Not a JSON, keep original text
        }

        navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        toast.success("Response copied to clipboard");
        setTimeout(() => setIsCopied(false), 2000);
    };

    const isSuccess = request.response && request.response.status >= 200 && request.response.status < 300;

    return (
        <div className="py-2.5 px-4 border-b border-[#ded7ce]/60 dark:border-white/8 flex justify-between items-center bg-[#fffdf9] dark:bg-[#18191e] transition-colors select-none">
            <span className="text-xs font-bold text-[#1a1714] dark:text-[#f4eadf]">
                Response
            </span>

            {request.response && (
                <div className="flex items-center gap-3">
                    {/* Status Pill */}
                    <div
                        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isSuccess
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40"
                                : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-800/40"
                        }`}
                    >
                        <span
                            className={`w-1.5 h-1.5 rounded-full ${
                                isSuccess ? "bg-emerald-500" : "bg-red-500"
                            }`}
                        />
                        <span>
                            {request.response.status === 0 ? "Error" : `${request.response.status} ${request.response.status_text || "OK"}`}
                        </span>
                    </div>

                    {/* Time & Size metrics */}
                    <div className="flex items-center gap-2 text-xs font-mono text-[#8a7e72] dark:text-[#a89f91]">
                        <span>{request.response.time_ms} ms</span>
                        <span>•</span>
                        <span>{formatSize(request.response.size_bytes ?? new Blob([request.response.body]).size)}</span>
                    </div>

                    <div className="h-3.5 w-px bg-[#ded7ce]/80 dark:bg-white/10 mx-0.5" />

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        {onExpandResponse && (
                            <button
                                type="button"
                                onClick={onExpandResponse}
                                className="text-[#8a7e72] hover:text-[#1a1714] dark:text-[#a89f91] dark:hover:text-[#f4eadf] p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                title="Expand response"
                                aria-label="Expand response"
                            >
                                <Maximize2 size={14} />
                            </button>
                        )}
                        {onSaveResponse && (
                            <button
                                onClick={onSaveResponse}
                                className="text-[#8a7e72] hover:text-[#1a1714] dark:text-[#a89f91] dark:hover:text-[#f4eadf] p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                title="Save Response"
                            >
                                <Bookmark size={14} />
                            </button>
                        )}
                        {!isMediaResponse(request.response) && <button
                            onClick={handleCopyResponse}
                            className="text-[#8a7e72] hover:text-[#1a1714] dark:text-[#a89f91] dark:hover:text-[#f4eadf] p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                            title="Copy Response"
                        >
                            {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>}
                        {onToggleCollapse ? (
                            <button
                                onClick={onToggleCollapse}
                                className="text-[#8a7e72] hover:text-[#1a1714] dark:text-[#a89f91] dark:hover:text-[#f4eadf] p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                title={isCollapsed ? "Expand response" : "Collapse response"}
                            >
                                {isCollapsed ? <ChevronsUp size={14} /> : <ChevronsDown size={14} />}
                            </button>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};
