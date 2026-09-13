import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { RequestHeader } from "@/types";
import { COMMON_HEADER_KEYS, getCommonHeaderValues } from "@/utils/headers.constants";
import { VarBadge } from "@/components/common/VarBadge";

interface HeadersTabProps {
    headers: RequestHeader[];
    onUpdate: (headers: RequestHeader[]) => void;
    variableKeys?: string[];
    variablePreview?: Record<string, string>;
}

export const HeadersTab = ({ headers: initialHeaders, onUpdate, variableKeys = [], variablePreview = {} }: HeadersTabProps) => {
    const [localHeaders, setLocalHeaders] = useState<RequestHeader[]>([]);
    const [focusedField, setFocusedField] = useState<{ id: string; field: 'key' | 'value' } | null>(null);
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    useEffect(() => {
        const headersArray = (Array.isArray(initialHeaders) ? initialHeaders : [])
            .filter(h => h !== null && typeof h === 'object');

        if (headersArray.length > 0) {
            const last = headersArray[headersArray.length - 1];
            if (last && (last.key || last.value)) {
                 setLocalHeaders([...headersArray, { id: crypto.randomUUID(), request_id: '', key: "", value: "", is_active: 1 }]);
            } else {
                setLocalHeaders(headersArray);
            }
        } else {
             setLocalHeaders([{ id: crypto.randomUUID(), request_id: '', key: "", value: "", is_active: 1 }]);
        }
    }, [initialHeaders]);

    const updateHeader = (id: string, field: keyof RequestHeader, value: any) => {
        const currentHeader = localHeaders.find((header) => header && header.id === id);
        const newHeaders = localHeaders
            .filter(h => h !== null)
            .map((header) => {
                if (header.id !== id) return header;

                const updatedHeader = { ...header, [field]: value };
                if (field === 'key' && currentHeader && !currentHeader.value) {
                    const suggestedValues = getCommonHeaderValues(value);
                    if (suggestedValues.length > 0) {
                        updatedHeader.value = suggestedValues[0];
                    }
                }

                return updatedHeader;
            });
        
        // Auto-add and remove empty logic
        const lastHeader = newHeaders[newHeaders.length - 1];
        if (lastHeader && (lastHeader.key || lastHeader.value)) {
            newHeaders.push({ id: crypto.randomUUID(), request_id: '', key: "", value: "", is_active: 1 });
        }

        setLocalHeaders(newHeaders);
        onUpdate(newHeaders);
    };

    const removeHeader = (id: string) => {
        let newHeaders = localHeaders.filter(h => h && h.id !== id);
        
        // Ensure there's always at least one empty row at the end
        if (newHeaders.length === 0 || (newHeaders[newHeaders.length - 1] && (newHeaders[newHeaders.length - 1].key || newHeaders[newHeaders.length - 1].value))) {
                newHeaders.push({ id: crypto.randomUUID(), request_id: '', key: "", value: "", is_active: 1 });
        }
        
        setLocalHeaders(newHeaders);
        onUpdate(newHeaders);
    };

    const getKeySuggestions = (value: string = "") => {
        const valStr = value || "";
        const normalized = valStr.trim().toLowerCase();
        return COMMON_HEADER_KEYS
            .filter((item) => item.toLowerCase().includes(normalized))
            .slice(0, 6);
    };

    const getValueSuggestions = (key: string = "", value: string = "") => {
        const valStr = value || "";
        const normalized = valStr.trim().toLowerCase();
        const commonValues = getCommonHeaderValues(key);
        const envValues = (variableKeys || []).map((envKey) => `{{${envKey}}}`);
        const merged = [...commonValues, ...envValues];
        return merged
            .filter((item, index) => merged.indexOf(item) === index)
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
                            <th className="py-2 px-3 w-1/2">Key</th>
                            <th className="py-2 px-3 w-1/2">Value</th>
                            <th className="py-2 px-3 w-10 text-center"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ded7ce]/40 dark:divide-white/5">
                        {localHeaders.filter(h => h !== null).map((header, index) => {
                            const isLast = index === localHeaders.length - 1;
                            const isValueFocused = focusedField?.id === header.id && focusedField.field === 'value';
                            const headerValue = header.value || "";
                            const hasVars = /{{\s*[A-Za-z0-9_.-]+\s*}}/.test(headerValue);
                            const suggestions = getValueSuggestions(header.key, headerValue);

                            return (
                                <tr key={header.id} className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="py-1.5 px-3 text-center align-middle">
                                        {!isLast ? (
                                            <input
                                                type="checkbox"
                                                className="w-3.5 h-3.5 accent-[#0066ff] rounded cursor-pointer"
                                                checked={header.is_active === 1}
                                                onChange={(e) => updateHeader(header.id, 'is_active', e.target.checked ? 1 : 0)}
                                            />
                                        ) : (
                                            <input 
                                                type="checkbox" 
                                                disabled
                                                className="w-3.5 h-3.5 opacity-30 rounded cursor-not-allowed" 
                                            />
                                        )}
                                    </td>
                                    <td className="p-1 relative align-middle">
                                        <input
                                            type="text"
                                            placeholder={isLast ? "Add header..." : "Key"}
                                            className="w-full px-2 py-1 bg-transparent border border-transparent focus:border-[#0066ff]/40 focus:bg-white dark:focus:bg-[#121316] rounded text-xs font-mono text-[#1a1714] dark:text-[#f4eadf] placeholder:text-[#8a7e72]/70 focus:outline-none"
                                            value={header.key || ""}
                                            onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                                            onFocus={() => setFocusedField({ id: header.id, field: 'key' })}
                                            onBlur={() => setTimeout(() => setFocusedField(null), 120)}
                                        />
                                        {focusedField?.id === header.id && focusedField.field === 'key' && getKeySuggestions(header.key).length > 0 ? (
                                            <div className="absolute left-1 right-1 top-full mt-1 z-30 rounded-xl border border-[#ded7ce] dark:border-white/10 bg-[#fffdf9] dark:bg-[#1c1d24] shadow-xl p-1">
                                                {getKeySuggestions(header.key).map((suggestedKey) => (
                                                    <button key={suggestedKey} type="button"
                                                        className="w-full text-left px-2 py-1 rounded-lg text-xs text-[#1a1714] dark:text-[#f4eadf] hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                                        onMouseDown={() => updateHeader(header.id, 'key', suggestedKey)}
                                                    >{suggestedKey}</button>
                                                ))}
                                            </div>
                                        ) : null}
                                    </td>
                                    <td className="p-1 relative align-middle">
                                        <div
                                            className="relative cursor-text"
                                            onClick={() => inputRefs.current[header.id]?.focus()}
                                        >
                                            {/* Input — visible while focused OR when no vars */}
                                            <input
                                                ref={el => { inputRefs.current[header.id] = el; }}
                                                type="text"
                                                placeholder={isLast ? "" : "Value"}
                                                value={headerValue}
                                                onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                                                onFocus={() => setFocusedField({ id: header.id, field: 'value' })}
                                                onBlur={() => setTimeout(() => setFocusedField(null), 120)}
                                                className={`w-full px-2 py-1 bg-transparent border border-transparent focus:border-[#0066ff]/40 focus:bg-white dark:focus:bg-[#121316] rounded text-xs font-mono text-[#1a1714] dark:text-[#f4eadf] placeholder:text-[#8a7e72]/70 focus:outline-none ${!isValueFocused && hasVars ? 'opacity-0 absolute inset-0 h-full pointer-events-none' : ''}`}
                                            />
                                            {/* Overlay — visible when blurred and value has vars */}
                                            {!isValueFocused && hasVars && (
                                                <div className="px-2 py-1 flex items-center flex-wrap gap-1 text-xs font-mono min-h-[26px]">
                                                    {renderValueOverlay(headerValue)}
                                                </div>
                                            )}
                                            {/* Suggestions dropdown */}
                                            {isValueFocused && suggestions.length > 0 && (
                                                <div className="absolute left-1 right-1 top-full mt-1 z-30 rounded-xl border border-[#ded7ce] dark:border-white/10 bg-[#fffdf9] dark:bg-[#1c1d24] shadow-xl p-1">
                                                    {suggestions.map((sv) => (
                                                        <button key={sv} type="button"
                                                            className="w-full text-left px-2 py-1 rounded-lg text-xs text-[#1a1714] dark:text-[#f4eadf] hover:bg-blue-50 dark:hover:bg-blue-950/40 font-mono"
                                                            onMouseDown={() => updateHeader(header.id, 'value', sv)}
                                                        >{sv}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-1.5 px-3 text-center align-middle opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!isLast && (
                                            <button onClick={() => removeHeader(header.id)}
                                                className="text-[#8a7e72] hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
                                                title="Delete header"
                                            ><Trash2 size={13} /></button>
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
