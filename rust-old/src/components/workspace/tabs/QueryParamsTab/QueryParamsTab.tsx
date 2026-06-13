import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { RequestParam } from "@/types";
import { VarBadge } from "@/components/common/VarBadge";

interface QueryParamsTabProps {
    params: RequestParam[];
    onUpdate: (params: RequestParam[]) => void;
    variableKeys?: string[];
    variablePreview?: Record<string, string>;
}

export const QueryParamsTab = ({ 
    params: initialParams, 
    onUpdate, 
    variableKeys = [], 
    variablePreview = {} 
}: QueryParamsTabProps) => {
    const [localParams, setLocalParams] = useState<RequestParam[]>([]);
    const [focusedField, setFocusedField] = useState<{ id: string; field: 'key' | 'value' | 'description' } | null>(null);
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    useEffect(() => {
        // Initialize local params from props, ensuring at least one empty row
        if (initialParams && initialParams.length > 0) {
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

    const getValueSuggestions = (value: string = "") => {
        const normalized = (value || "").trim().toLowerCase();
        const envValues = (variableKeys || []).map((envKey) => `{{${envKey}}}`);
        return envValues
            .filter((item) => item.toLowerCase().includes(normalized))
            .slice(0, 8);
    };

    const renderValueOverlay = (value: string = "") => {
        const valStr = value || "";
        const matches = Array.from(valStr.matchAll(/{{\s*([A-Za-z0-9_.-]+)\s*}}/g));
        if (matches.length === 0) {
            return <span className="text-gray-700 dark:text-gray-200 text-sm">{valStr}</span>;
        }
        const parts: ReactNode[] = [];
        let lastIndex = 0;
        matches.forEach((match, i) => {
            const fullMatch = match[0];
            const varName = match[1];
            const start = match.index ?? 0;
            if (start > lastIndex) {
                parts.push(<span key={`t${i}`} className="text-gray-700 dark:text-gray-200">{valStr.slice(lastIndex, start)}</span>);
            }
            parts.push(
                <span key={`v${i}`} className="inline-flex items-center">
                    <VarBadge
                        name={varName}
                        exists={varName in (variablePreview || {})}
                        resolvedValue={(variablePreview || {})[varName]}
                    />
                </span>
            );
            lastIndex = start + fullMatch.length;
        });
        if (lastIndex < valStr.length) {
            parts.push(<span key="tail" className="text-gray-700 dark:text-gray-200">{valStr.slice(lastIndex)}</span>);
        }
        return <>{parts}</>;
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
                            const isValueFocused = focusedField?.id === param.id && focusedField.field === 'value';
                            const paramValue = param.value || "";
                            const hasVars = /{{\s*[A-Za-z0-9_.-]+\s*}}/.test(paramValue);
                            const suggestions = getValueSuggestions(paramValue);

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
                                            value={param.key || ""}
                                            onChange={(e) => updateParam(param.id, 'key', e.target.value)}
                                            onFocus={() => setFocusedField({ id: param.id, field: 'key' })}
                                            onBlur={() => setTimeout(() => setFocusedField(null), 120)}
                                        />
                                    </td>
                                    <td className="p-1 relative">
                                        <div
                                            className="relative cursor-text"
                                            onClick={() => inputRefs.current[param.id]?.focus()}
                                        >
                                            {/* Input — visible while focused OR when no vars */}
                                            <input
                                                ref={el => { inputRefs.current[param.id] = el; }}
                                                type="text"
                                                placeholder="Value"
                                                value={paramValue}
                                                onChange={(e) => updateParam(param.id, 'value', e.target.value)}
                                                onFocus={() => setFocusedField({ id: param.id, field: 'value' })}
                                                onBlur={() => setTimeout(() => setFocusedField(null), 120)}
                                                className={`w-full p-1 bg-transparent border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none ${!isValueFocused && hasVars ? 'opacity-0 absolute inset-0 h-full pointer-events-none' : ''}`}
                                            />
                                            {/* Overlay — visible when blurred and value has vars */}
                                            {!isValueFocused && hasVars && (
                                                <div className="p-1 flex items-center flex-wrap gap-0.5 text-sm min-h-[28px]">
                                                    {renderValueOverlay(paramValue)}
                                                </div>
                                            )}
                                            {/* Suggestions dropdown */}
                                            {isValueFocused && suggestions.length > 0 && (
                                                <div className="absolute left-1 right-1 top-full mt-1 z-20 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-1">
                                                    {suggestions.map((sv) => (
                                                        <button key={sv} type="button"
                                                            className="w-full text-left px-2 py-1 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-mono"
                                                            onMouseDown={() => updateParam(param.id, 'value', sv)}
                                                        >{sv}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-1">
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            className="w-full p-1 bg-transparent border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
                                            value={param.description || ""}
                                            onChange={(e) => updateParam(param.id, 'description', e.target.value)}
                                            onFocus={() => setFocusedField({ id: param.id, field: 'description' })}
                                            onBlur={() => setTimeout(() => setFocusedField(null), 120)}
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
