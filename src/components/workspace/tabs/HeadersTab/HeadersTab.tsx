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
        const currentHeader = localHeaders.find((header) => header.id === id);
        const newHeaders = localHeaders.map((header) => {
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

    const getKeySuggestions = (value: string) => {
        const normalized = value.trim().toLowerCase();
        return COMMON_HEADER_KEYS
            .filter((item) => item.toLowerCase().includes(normalized))
            .slice(0, 6);
    };

    const getValueSuggestions = (key: string, value: string) => {
        const normalized = value.trim().toLowerCase();
        const commonValues = getCommonHeaderValues(key);
        const envValues = variableKeys.map((envKey) => `{{${envKey}}}`);
        const merged = [...commonValues, ...envValues];
        return merged
            .filter((item, index) => merged.indexOf(item) === index)
            .filter((item) => item.toLowerCase().includes(normalized))
            .slice(0, 8);
    };

    const renderValueOverlay = (value: string): ReactNode => {
        const matches = Array.from(value.matchAll(/{{\s*([A-Za-z0-9_.-]+)\s*}}/g));
        if (matches.length === 0) {
            return <span className="text-gray-700 dark:text-gray-200 text-sm">{value}</span>;
        }
        const parts: ReactNode[] = [];
        let lastIndex = 0;
        matches.forEach((match, i) => {
            const fullMatch = match[0];
            const varName = match[1];
            const start = match.index ?? 0;
            if (start > lastIndex) {
                parts.push(<span key={`t${i}`} className="text-gray-700 dark:text-gray-200">{value.slice(lastIndex, start)}</span>);
            }
            parts.push(
                <span key={`v${i}`} className="inline-flex items-center">
                    <VarBadge
                        name={varName}
                        exists={varName in variablePreview}
                        resolvedValue={variablePreview[varName]}
                    />
                </span>
            );
            lastIndex = start + fullMatch.length;
        });
        if (lastIndex < value.length) {
            parts.push(<span key="tail" className="text-gray-700 dark:text-gray-200">{value.slice(lastIndex)}</span>);
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
                            <th className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400 w-1/2">Key</th>
                            <th className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400 w-1/2">Value</th>
                            <th className="p-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {localHeaders.map((header, index) => {
                            const isLast = index === localHeaders.length - 1;
                            const isValueFocused = focusedField?.id === header.id && focusedField.field === 'value';
                            const hasVars = /{{\s*[A-Za-z0-9_.-]+\s*}}/.test(header.value);
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
                                    <td className="p-1 relative">
                                        <input
                                            type="text"
                                            placeholder="Key"
                                            className="w-full p-1 bg-transparent border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
                                            value={header.key}
                                            onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                                            onFocus={() => setFocusedField({ id: header.id, field: 'key' })}
                                            onBlur={() => setTimeout(() => setFocusedField(null), 120)}
                                        />
                                        {focusedField?.id === header.id && focusedField.field === 'key' && getKeySuggestions(header.key).length > 0 ? (
                                            <div className="absolute left-1 right-1 top-full mt-1 z-20 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-1">
                                                {getKeySuggestions(header.key).map((suggestedKey) => (
                                                    <button key={suggestedKey} type="button"
                                                        className="w-full text-left px-2 py-1 rounded-md text-xs text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                        onMouseDown={() => updateHeader(header.id, 'key', suggestedKey)}
                                                    >{suggestedKey}</button>
                                                ))}
                                            </div>
                                        ) : null}
                                    </td>
                                    <td className="p-1 relative">
                                        {(() => {
                                            const valueSuggestions = getValueSuggestions(header.key, header.value);
                                            return (
                                                <div
                                                    className="relative cursor-text"
                                                    onClick={() => inputRefs.current[header.id]?.focus()}
                                                >
                                                    {/* Input — visible while focused OR when no vars */}
                                                    <input
                                                        ref={el => { inputRefs.current[header.id] = el; }}
                                                        type="text"
                                                        placeholder="Value"
                                                        value={header.value}
                                                        onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                                                        onFocus={() => setFocusedField({ id: header.id, field: 'value' })}
                                                        onBlur={() => setTimeout(() => setFocusedField(null), 120)}
                                                        className={`w-full p-1 bg-transparent border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none ${!isValueFocused && hasVars ? 'opacity-0 absolute inset-0 h-full pointer-events-none' : ''}`}
                                                    />
                                                    {/* Overlay — visible when blurred and value has vars */}
                                                    {!isValueFocused && hasVars && (
                                                        <div className="p-1 flex items-center flex-wrap gap-0.5 text-sm min-h-[28px]">
                                                            {renderValueOverlay(header.value)}
                                                        </div>
                                                    )}
                                                    {/* Suggestions dropdown */}
                                                    {isValueFocused && valueSuggestions.length > 0 && (
                                                        <div className="absolute left-1 right-1 top-full mt-1 z-20 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-1">
                                                            {valueSuggestions.map((sv) => (
                                                                <button key={sv} type="button"
                                                                    className="w-full text-left px-2 py-1 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-mono"
                                                                    onMouseDown={() => updateHeader(header.id, 'value', sv)}
                                                                >{sv}</button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!isLast && (
                                            <button onClick={() => removeHeader(header.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                            ><Trash2 size={14} /></button>
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
