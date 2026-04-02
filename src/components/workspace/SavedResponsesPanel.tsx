import { SavedResponse } from "@/types";
import { Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { JsonViewer } from "./JsonViewer";

interface SavedResponsesPanelProps {
    responses: SavedResponse[];
    onDelete: (id: string) => void;
}

export const SavedResponsesPanel = ({ responses, onDelete }: SavedResponsesPanelProps) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (responses.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600 text-sm">
                No saved responses yet
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1 p-3 overflow-y-auto h-full">
            {responses.map((r) => (
                <div key={r.id} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    >
                        <span className="text-gray-400 dark:text-gray-500 shrink-0">
                            {expandedId === r.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </span>
                        <span className={`text-xs font-bold font-mono shrink-0 ${r.status >= 200 && r.status < 300 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                            {r.status}
                        </span>
                        <span className="text-xs text-gray-700 dark:text-gray-200 flex-1 truncate">{r.name}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{r.time_ms}ms</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(r.id); }}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer shrink-0"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                    {expandedId === r.id && (
                        <div className="p-3 bg-white dark:bg-gray-900 max-h-64 overflow-y-auto">
                            <JsonViewer data={r.body ?? ''} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
