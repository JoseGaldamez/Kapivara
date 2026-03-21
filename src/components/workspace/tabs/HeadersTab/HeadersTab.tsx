import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { RequestHeader } from "@/types";

interface HeadersTabProps {
    headers: RequestHeader[];
    onUpdate: (headers: RequestHeader[]) => void;
}

export const HeadersTab = ({ headers: initialHeaders, onUpdate }: HeadersTabProps) => {
   
    const [localHeaders, setLocalHeaders] = useState<RequestHeader[]>([]);

    useEffect(() => {
        // Initialize local headers from props, ensuring at least one empty row
        if (initialHeaders && initialHeaders.length > 0) {
            // Check if last one is empty, if not add one
            const last = initialHeaders[initialHeaders.length - 1];
            if (last.key || last.value) {
                 setLocalHeaders([...initialHeaders, { id: crypto.randomUUID(), request_id: '', key: "", value: "", is_active: 1 }]);
            } else {
                setLocalHeaders(initialHeaders);
            }
        } else {
             setLocalHeaders([{ id: crypto.randomUUID(), request_id: '', key: "", value: "", is_active: 1 }]);
        }
    }, [initialHeaders]);

    const updateHeader = (id: string, field: keyof RequestHeader, value: any) => {
        const newHeaders = localHeaders.map(h => h.id === id ? { ...h, [field]: value } : h);
        
         // Auto-add and remove empty logic
        const lastHeader = newHeaders[newHeaders.length - 1];
        if (lastHeader.key || lastHeader.value) {
            newHeaders.push({ id: crypto.randomUUID(), request_id: '', key: "", value: "", is_active: 1 });
        }

        setLocalHeaders(newHeaders);
        onUpdate(newHeaders);
    };

    const removeHeader = (id: string) => {
        let newHeaders = localHeaders.filter(h => h.id !== id);
        
        // Ensure there's always at least one empty row at the end
        if (newHeaders.length === 0 || (newHeaders[newHeaders.length - 1].key || newHeaders[newHeaders.length - 1].value)) {
                newHeaders.push({ id: crypto.randomUUID(), request_id: '', key: "", value: "", is_active: 1 });
        }
        
        setLocalHeaders(newHeaders);
        onUpdate(newHeaders);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                            <th className="p-2 w-8"></th>
                            <th className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400 w-1/2">Key</th>
                            <th className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400 w-1/2">Value</th>
                            <th className="p-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {localHeaders.map((header, index) => {
                            const isLast = index === localHeaders.length - 1;
                            return (
                                <tr key={header.id} className="group border-b border-gray-100 dark:border-gray-800/50">
                                    <td className="p-2 text-center">
                                        {!isLast && (
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-gray-300 dark:border-gray-600 cursor-pointer" 
                                                checked={header.is_active === 1}
                                                onChange={(e) => updateHeader(header.id, 'is_active', e.target.checked ? 1 : 0)}
                                            />
                                        )}
                                    </td>
                                    <td className="p-1">
                                        <input
                                            type="text"
                                            placeholder="Key"
                                            className="w-full p-1 bg-transparent border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
                                            value={header.key}
                                            onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-1">
                                        <input
                                            type="text"
                                            placeholder="Value"
                                            className="w-full p-1 bg-transparent border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
                                            value={header.value}
                                            onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!isLast && (
                                            <button 
                                                onClick={() => removeHeader(header.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
