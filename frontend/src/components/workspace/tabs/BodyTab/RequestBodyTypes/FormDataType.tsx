import { Trash2, FolderOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { OpenFileDialog } from "../../../../../../wailsjs/go/main/App";
import { VarBadge } from "@/components/common/VarBadge";

interface FormDataItem {
    id: string;
    key: string;
    value: string;
    type: 'text' | 'file';
    is_active: number;
}

interface FormDataTypeProps {
    value: string;
    onChange: (value: string) => void;
    variableKeys?: string[];
    variablePreview?: Record<string, string>;
}

export const FormDataType = ({ 
    value: initialValue, 
    onChange, 
    variableKeys = [], 
    variablePreview = {} 
}: FormDataTypeProps) => {
    const [localItems, setLocalItems] = useState<FormDataItem[]>([]);
    const [focusedField, setFocusedField] = useState<{ id: string; field: 'key' | 'value' } | null>(null);
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    
    // Track if this component has already initialized its local state.
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        let parsed: FormDataItem[] = [];
        try {
            parsed = initialValue ? JSON.parse(initialValue) : [];
        } catch {
            parsed = [];
        }

        if (parsed.length > 0) {
            const last = parsed[parsed.length - 1];
            if (last.key || last.value) {
                setLocalItems([...parsed, { id: crypto.randomUUID(), key: "", value: "", type: "text", is_active: 1 }]);
            } else {
                setLocalItems(parsed);
            }
        } else {
            setLocalItems([{ id: crypto.randomUUID(), key: "", value: "", type: "text", is_active: 1 }]);
        }
    }, [initialValue]);

    const updateItem = (id: string, field: keyof FormDataItem, val: any) => {
        const newItems = localItems.map(h => h.id === id ? { ...h, [field]: val } : h);

        const lastItem = newItems[newItems.length - 1];
        if (lastItem.key || lastItem.value) {
            newItems.push({ id: crypto.randomUUID(), key: "", value: "", type: "text", is_active: 1 });
        }

        setLocalItems(newItems);
        onChange(JSON.stringify(newItems.filter(i => i.key || i.value)));
    };

    const removeItem = (id: string) => {
        let newItems = localItems.filter(h => h.id !== id);

        if (newItems.length === 0 || (newItems[newItems.length - 1].key || newItems[newItems.length - 1].value)) {
            newItems.push({ id: crypto.randomUUID(), key: "", value: "", type: "text", is_active: 1 });
        }

        setLocalItems(newItems);
        onChange(JSON.stringify(newItems.filter(i => i.key || i.value)));
    };

    const handleSelectFile = async (id: string) => {
        try {
            const selected = await OpenFileDialog();
            if (selected) {
                updateItem(id, 'value', selected);
            }
        } catch (error) {
            console.error("Failed to select file", error);
        }
    };

    const getValueSuggestions = (value: string = "") => {
        const valStr = value || "";
        const normalized = valStr.trim().toLowerCase();
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
                            <th className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400 w-24">Type</th>
                            <th className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400 w-1/3">Value</th>
                            <th className="p-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {localItems.map((item, index) => {
                            const isLast = index === localItems.length - 1;
                            const isValueFocused = focusedField?.id === item.id && focusedField.field === 'value';
                            const itemValue = item.value || "";
                            const hasVars = item.type !== 'file' && /{{\s*[A-Za-z0-9_.-]+\s*}}/.test(itemValue);
                            const suggestions = getValueSuggestions(itemValue);

                            return (
                                <tr key={item.id} className="group border-b border-gray-100 dark:border-gray-800/50">
                                    <td className="p-2 text-center">
                                        {!isLast && (
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 dark:border-gray-600 cursor-pointer"
                                                checked={item.is_active === 1}
                                                onChange={(e) => updateItem(item.id, 'is_active', e.target.checked ? 1 : 0)}
                                            />
                                        )}
                                    </td>
                                    <td className="p-1">
                                        <input
                                            type="text"
                                            placeholder="Key"
                                            className="w-full p-1 bg-transparent border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
                                            value={item.key || ""}
                                            onChange={(e) => updateItem(item.id, 'key', e.target.value)}
                                            onFocus={() => setFocusedField({ id: item.id, field: 'key' })}
                                            onBlur={() => setTimeout(() => setFocusedField(null), 120)}
                                        />
                                    </td>
                                    <td className="p-1">
                                        <select
                                            className="w-full p-1 bg-transparent border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none appearance-none"
                                            value={item.type || 'text'}
                                            onChange={(e) => updateItem(item.id, 'type', e.target.value)}
                                        >
                                            <option value="text">Text</option>
                                            <option value="file">File</option>
                                        </select>
                                    </td>
                                    <td className="p-1 relative">
                                        {item.type === 'file' ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleSelectFile(item.id)}
                                                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs flex items-center gap-1 transition-colors"
                                                >
                                                    <FolderOpen size={14} /> Select File
                                                </button>
                                                <span className="text-xs text-gray-500 truncate max-w-[150px]" title={itemValue}>
                                                    {itemValue ? itemValue.split(/[/\\]/).pop() : 'No file selected'}
                                                </span>
                                            </div>
                                        ) : (
                                            <div
                                                className="relative cursor-text"
                                                onClick={() => inputRefs.current[item.id]?.focus()}
                                            >
                                                {/* Input — visible while focused OR when no vars */}
                                                <input
                                                    ref={el => { inputRefs.current[item.id] = el; }}
                                                    type="text"
                                                    placeholder="Value"
                                                    value={itemValue}
                                                    onChange={(e) => updateItem(item.id, 'value', e.target.value)}
                                                    onFocus={() => setFocusedField({ id: item.id, field: 'value' })}
                                                    onBlur={() => setTimeout(() => setFocusedField(null), 120)}
                                                    className={`w-full p-1 bg-transparent border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none ${!isValueFocused && hasVars ? 'opacity-0 absolute inset-0 h-full pointer-events-none' : ''}`}
                                                />
                                                {/* Overlay — visible when blurred and value has vars */}
                                                {!isValueFocused && hasVars && (
                                                    <div className="p-1 flex items-center flex-wrap gap-0.5 text-sm min-h-[28px]">
                                                        {renderValueOverlay(itemValue)}
                                                    </div>
                                                )}
                                                {/* Suggestions dropdown */}
                                                {isValueFocused && suggestions.length > 0 && (
                                                    <div className="absolute left-1 right-1 top-full mt-1 z-20 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-1">
                                                        {suggestions.map((sv) => (
                                                            <button key={sv} type="button"
                                                                className="w-full text-left px-2 py-1 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-mono"
                                                                onMouseDown={() => updateItem(item.id, 'value', sv)}
                                                            >{sv}</button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!isLast && (
                                            <button
                                                onClick={() => removeItem(item.id)}
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
