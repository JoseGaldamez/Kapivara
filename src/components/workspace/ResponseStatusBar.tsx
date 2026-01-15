
import { RequestInfo } from "@/types";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export const ResponseStatusBar = ({ request }: { request: RequestInfo }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyResponse = () => {
        if (!request.response?.body) return;

        let textToCopy = request.response.body;
        try {
            const parsed = JSON.parse(textToCopy);
            textToCopy = JSON.stringify(parsed, null, 2);
        } catch (e) {
            // Not a JSON, keep original text
        }

        navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        toast.success("Response copied to clipboard");
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="p-2 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center px-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Response</span>
            {request.response && (
                <div className="flex items-center gap-4">
                    <div className="flex gap-4 text-xs font-mono">
                        <span className={`font-bold ${request.response.status >= 200 && request.response.status < 300 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                            Status: {request.response.status} {request.response.status_text}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">Time: {request.response.time_ms}ms</span>
                    </div>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
                    <button
                        onClick={handleCopyResponse}
                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        title="Copy Response"
                    >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>
            )}
        </div>
    )
}