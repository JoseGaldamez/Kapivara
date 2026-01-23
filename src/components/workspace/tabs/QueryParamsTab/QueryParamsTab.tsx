import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { RequestParam } from "@/types";

interface QueryParamsTabProps {
    params: RequestParam[];
    onUpdate: (params: RequestParam[]) => void;
}

export const QueryParamsTab = ({ params: initialParams, onUpdate }: QueryParamsTabProps) => {
   
    const [localParams, setLocalParams] = useState<RequestParam[]>([]);

    useEffect(() => {
        // Initialize local params from props, ensuring at least one empty row
        if (initialParams && initialParams.length > 0) {
            // Check if last one is empty, if not add one
            const last = initialParams[initialParams.length - 1];
            if (last.key || last.value || last.description) {
                 setLocalParams([...initialParams, { id: crypto.randomUUID(), request_id: '', key: "", value: "", description: "", is_active: 1 }]);
            } else {
                setLocalParams(initialParams);
            }
        } else {
             setLocalParams([{ id: crypto.randomUUID(), request_id: '', key: "", value: "", description: "", is_active: 1 }]);
        }
    }, [initialParams]);

    const updateParam = (id: string, field: keyof RequestParam, value: any) => {
        const newParams = localParams.map(p => p.id === id ? { ...p, [field]: value } : p);
        
         // Auto-add and remove empty logic
        const lastParam = newParams[newParams.length - 1];
        if (lastParam.key || lastParam.value || lastParam.description) {
            newParams.push({ id: crypto.randomUUID(), request_id: '', key: "", value: "", description: "", is_active: 1 });
        }

        setLocalParams(newParams);
        onUpdate(newParams);
    };

    const removeParam = (id: string) => {
        let newParams = localParams.filter(p => p.id !== id);
        
        // Ensure there's always at least one empty row at the end
        if (newParams.length === 0 || (newParams[newParams.length - 1].key || newParams[newParams.length - 1].value || newParams[newParams.length - 1].description)) {
                newParams.push({ id: crypto.randomUUID(), request_id: '', key: "", value: "", description: "", is_active: 1 });
        }
        
        setLocalParams(newParams);
        onUpdate(newParams);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                            <th className="p-2 w-8"></th>
                            <th className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400 w-1/3">Key</th>
                            <th className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400 w-1/3">Value</th>
                            <th className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Description</th>
                            <th className="p-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {localParams.map((param, index) => {
                            const isLast = index === localParams.length - 1;
                            return (
                                <tr key={param.id} className="group border-b border-gray-100 dark:border-gray-800/50">
                                    <td className="p-2 text-center">
                                        {!isLast && (
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-gray-300 dark:border-gray-600 cursor-pointer" 
                                                checked={param.is_active === 1}
                                                onChange={(e) => updateParam(param.id, 'is_active', e.target.checked ? 1 : 0)}
                                            />
                                        )}
                                    </td>
                                    <td className="p-1">
                                        <input
                                            type="text"
                                            placeholder="Key"
                                            className="w-full p-1 bg-transparent border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
                                            value={param.key}
                                            onChange={(e) => updateParam(param.id, 'key', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-1">
                                        <input
                                            type="text"
                                            placeholder="Value"
                                            className="w-full p-1 bg-transparent border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
                                            value={param.value}
                                            onChange={(e) => updateParam(param.id, 'value', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-1">
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            className="w-full p-1 bg-transparent border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
                                            value={param.description || ""}
                                            onChange={(e) => updateParam(param.id, 'description', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!isLast && (
                                            <button 
                                                onClick={() => removeParam(param.id)}
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
