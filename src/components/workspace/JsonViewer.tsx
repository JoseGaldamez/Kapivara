import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

interface JsonViewerProps {
    data: string; // Raw string data
}

const JsonNode = ({ name, value, isLast = true }: { name?: string, value: any, isLast?: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const isObject = value !== null && typeof value === 'object';
    const isArray = Array.isArray(value);
    const isEmpty = isObject && Object.keys(value).length === 0;

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    if (isObject && !isEmpty) {
        const keys = Object.keys(value);
        const opening = isArray ? '[' : '{';
        const closing = isArray ? ']' : '}';
        const preview = isArray ? `Array(${keys.length})` : `{...}`;

        return (
            <div className="font-mono text-sm leading-6">
                <div className="flex items-start hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm" >
                    <span className="mr-1 mt-1 text-gray-400">
                        {isExpanded ? <ChevronDown size={14} onClick={toggle} className="cursor-pointer" /> : <ChevronRight size={14} onClick={toggle} className="cursor-pointer" />}
                    </span>
                    <span className="mr-1">
                        {name && <span className="text-purple-600 dark:text-purple-400 font-semibold">"{name}": </span>}
                        <span className="text-gray-600 dark:text-gray-300">{opening}</span>
                    </span>
                    {!isExpanded && (
                        <span className="text-gray-400 dark:text-gray-500 italic text-xs ml-1">{preview}</span>
                    )}
                    {!isExpanded && (
                        <span className="text-gray-600 dark:text-gray-300">{closing}{!isLast && ','}</span>
                    )}
                </div>

                {isExpanded && (
                    <div className="pl-6 border-l border-gray-100 dark:border-gray-800 ml-2">
                        {keys.map((key, index) => (
                            <JsonNode
                                key={key}
                                name={isArray ? undefined : key}
                                value={value[key]}
                                isLast={index === keys.length - 1}
                            />
                        ))}
                    </div>
                )}

                {isExpanded && (
                    <div className="pl-6">
                        <span className="text-gray-600 dark:text-gray-300">{closing}{!isLast && ','}</span>
                    </div>
                )}
            </div>
        );
    }

    // Primitive values
    let renderValue = <span className="text-gray-800 dark:text-gray-200">{String(value)}</span>;
    if (typeof value === 'string') {
        renderValue = <span className="text-green-600 dark:text-green-400">"{value}"</span>;
    } else if (typeof value === 'number') {
        renderValue = <span className="text-blue-600 dark:text-blue-400">{value}</span>;
    } else if (typeof value === 'boolean') {
        renderValue = <span className="text-orange-600 dark:text-orange-400 font-bold">{String(value)}</span>;
    } else if (value === null) {
        renderValue = <span className="text-gray-500 dark:text-gray-400 italic">null</span>;
    } else if (isEmpty) {
        renderValue = <span className="text-gray-600 dark:text-gray-400">{isArray ? '[]' : '{}'}</span>;
    }

    return (
        <div className="font-mono text-sm leading-6 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm flex">
            {/* Spacer for alignment with collapsible nodes arrows */}
            <span className="w-5 inline-block"></span>
            <span>
                {name && <span className="text-purple-600 dark:text-purple-400 font-semibold">"{name}": </span>}
                {renderValue}
                {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
            </span>
        </div>
    );
};

export const JsonViewer = ({ data }: JsonViewerProps) => {
    let parsedData = null;
    let isJson = false;

    try {
        parsedData = JSON.parse(data);
        isJson = true;
    } catch (e) {
        // Not JSON
    }

    if (!isJson) {
        return (
            <pre className="whitespace-pre-wrap break-all text-gray-800 dark:text-gray-200 font-mono text-sm p-4">
                {data}
            </pre>
        );
    }

    return (
        <div className="p-4 w-full">
            <JsonNode value={parsedData} />
        </div>
    );
};
