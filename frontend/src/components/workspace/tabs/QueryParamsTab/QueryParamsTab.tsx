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
                        <tr className="border-b border-[#ded7ce]/70 dark:border-white/8 text-xs font-semibold text-[#8a7e72] dark:text-[#a89f91]">
                            <th className="py-2 px-3 w-8 text-center"></th>
                            <th className="py-2 px-3 w-1/3">Key</th>
                            <th className="py-2 px-3 w-1/3">Value</th>
                            <th className="py-2 px-3">Description</th>
                            <th className="py-2 px-3 w-10 text-center"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ded7ce]/40 dark:divide-white/5">
                        {localParams.map((param, index) => {
                            const isLast = index === localParams.length - 1;
                            const isValueFocused = focusedField?.id === param.id && focusedField.field === 'value';
                            const paramValue = param.value || "";
                            const hasVars = /{{\s*[A-Za-z0-9_.-]+\s*}}/.test(paramValue);
                            const suggestions = getValueSuggestions(paramValue);

                            return (
                                <tr key={param.id} className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="py-1.5 px-3 text-center align-middle">
                                        {!isLast ? (
                                            <input 
                                                type="checkbox" 
                                                className="w-3.5 h-3.5 accent-[#0066ff] rounded cursor-pointer" 
                                                checked={param.is_active === 1}
                                                onChange={(e) => updateParam(param.id, 'is_active', e.target.checked ? 1 : 0)}
                                            />
                                        ) : (
                                            <input 
                                                type="checkbox" 
                                                disabled
                                                className="w-3.5 h-3.5 opacity-30 rounded cursor-not-allowed" 
                                            />
                                        )}
                                    </td>
                                    <td className="p-1 align-middle">
                                        <input
                                            type="text"
                                            placeholder={isLast ? "Add parameter..." : "Key"}
                                            className="w-full px-2 py-1 bg-transparent border border-transparent focus:border-[#0066ff]/40 focus:bg-white dark:focus:bg-[#121316] rounded text-xs font-mono text-[#1a1714] dark:text-[#f4eadf] placeholder:text-[#8a7e72]/70 focus:outline-none"
                                            value={param.key || ""}
                                            onChange={(e) => updateParam(param.id, 'key', e.target.value)}
                                            onFocus={() => setFocusedField({ id: param.id, field: 'key' })}
                                            onBlur={() => setTimeout(() => setFocusedField(null), 120)}
                                        />
                                    </td>
                                    <td className="p-1 relative align-middle">
                                        <div
                                            className="relative cursor-text"
                                            onClick={() => inputRefs.current[param.id]?.focus()}
                                        >
                                            {/* Input — visible while focused OR when no vars */}
                                            <input
                                                ref={el => { inputRefs.current[param.id] = el; }}
                                                type="text"
                                                placeholder={isLast ? "" : "Value"}
                                                value={paramValue}
                                                onChange={(e) => updateParam(param.id, 'value', e.target.value)}
                                                onFocus={() => setFocusedField({ id: param.id, field: 'value' })}
                                                onBlur={() => setTimeout(() => setFocusedField(null), 120)}
                                                className={`w-full px-2 py-1 bg-transparent border border-transparent focus:border-[#0066ff]/40 focus:bg-white dark:focus:bg-[#121316] rounded text-xs font-mono text-[#1a1714] dark:text-[#f4eadf] placeholder:text-[#8a7e72]/70 focus:outline-none ${!isValueFocused && hasVars ? 'opacity-0 absolute inset-0 h-full pointer-events-none' : ''}`}
                                            />
                                            {/* Overlay — visible when blurred and value has vars */}
                                            {!isValueFocused && hasVars && (
                                                <div className="px-2 py-1 flex items-center flex-wrap gap-1 text-xs font-mono min-h-[26px]">
                                                    {renderValueOverlay(paramValue)}
                                                </div>
                                            )}
                                            {/* Suggestions dropdown */}
                                            {isValueFocused && suggestions.length > 0 && (
                                                <div className="absolute left-1 right-1 top-full mt-1 z-30 rounded-xl border border-[#ded7ce] dark:border-white/10 bg-[#fffdf9] dark:bg-[#1c1d24] shadow-xl p-1">
                                                    {suggestions.map((sv) => (
                                                        <button key={sv} type="button"
                                                            className="w-full text-left px-2 py-1 rounded-lg text-xs text-[#1a1714] dark:text-[#f4eadf] hover:bg-blue-50 dark:hover:bg-blue-950/40 font-mono"
                                                            onMouseDown={() => updateParam(param.id, 'value', sv)}
                                                        >{sv}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-1 align-middle">
                                        <input
                                            type="text"
                                            placeholder={isLast ? "" : "Description"}
                                            className="w-full px-2 py-1 bg-transparent border border-transparent focus:border-[#0066ff]/40 focus:bg-white dark:focus:bg-[#121316] rounded text-xs text-[#5f554e] dark:text-[#a89f91] placeholder:text-[#8a7e72]/70 focus:outline-none"
                                            value={param.description || ""}
                                            onChange={(e) => updateParam(param.id, 'description', e.target.value)}
                                            onFocus={() => setFocusedField({ id: param.id, field: 'description' })}
                                            onBlur={() => setTimeout(() => setFocusedField(null), 120)}
                                        />
                                    </td>
                                    <td className="py-1.5 px-3 text-center align-middle opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!isLast && (
                                            <button 
                                                onClick={() => removeParam(param.id)}
                                                className="text-[#8a7e72] hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
                                                title="Delete parameter"
                                            >
                                                <Trash2 size={13} />
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
