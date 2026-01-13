
import { RequestInfo } from "@/types";

export const ResponseStatusBar = ({ request }: { request: RequestInfo }) => {
    return (
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
    )
}