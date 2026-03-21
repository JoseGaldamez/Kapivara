import { Trash2, FolderOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";

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
}

export const FormDataType = ({ value: initialValue, onChange }: FormDataTypeProps) => {
    const [localItems, setLocalItems] = useState<FormDataItem[]>([]);
    // Track if this component has already initialized its local state.
    // This prevents the useEffect from resetting the items when `onChange`
    // triggers a re-render of the parent, which would pass the new value back as
    // `initialValue`, causing a reset loop that loses file paths.
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
            const selected = await open({
                multiple: false,
                directory: false,
            });
            if (selected && typeof selected === 'string') {
                updateItem(id, 'value', selected);
            } else if (selected && Array.isArray(selected) && selected.length > 0) {
                updateItem(id, 'value', selected[0]);
            }
        } catch (error) {
            console.error("Failed to select file", error);
        }
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
                                            value={item.key}
                                            onChange={(e) => updateItem(item.id, 'key', e.target.value)}
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
                                    <td className="p-1">
                                        {item.type === 'file' ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleSelectFile(item.id)}
                                                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs flex items-center gap-1 transition-colors"
                                                >
                                                    <FolderOpen size={14} /> Select File
                                                </button>
                                                <span className="text-xs text-gray-500 truncate max-w-[150px]" title={item.value}>
                                                    {item.value ? item.value.split(/[/\\]/).pop() : 'No file selected'}
                                                </span>
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder="Value"
                                                className="w-full p-1 bg-transparent border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
                                                value={item.value}
                                                onChange={(e) => updateItem(item.id, 'value', e.target.value)}
                                            />
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
