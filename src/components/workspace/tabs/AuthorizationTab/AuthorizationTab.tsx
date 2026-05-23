import { useState, useRef, ReactNode } from "react";
import { Select } from "@/components/common/Select";
import { VarBadge } from "@/components/common/VarBadge";

interface AuthorizationTabProps {
    auth: any;
    onUpdate: (newAuth: any) => void;
    variableKeys?: string[];
    variablePreview?: Record<string, string>;
}

const AUTH_TYPES = [
    { value: 'none', label: 'No Auth' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'apikey', label: 'API Key' }
];

interface EnvironmentInputProps {
    type?: string;
    placeholder: string;
    value: string;
    onChange: (val: string) => void;
    variableKeys: string[];
    variablePreview: Record<string, string>;
    className?: string;
}

const EnvironmentInput = ({
    type = "text",
    placeholder,
    value,
    onChange,
    variableKeys,
    variablePreview,
    className = ""
}: EnvironmentInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const getValueSuggestions = (val: string) => {
        const normalized = (val || "").trim().toLowerCase();
        const envValues = (variableKeys || []).map((envKey) => `{{${envKey}}}`);
        return envValues
            .filter((item) => item.toLowerCase().includes(normalized))
            .slice(0, 8);
    };

    const renderValueOverlay = (val: string) => {
        const matches = Array.from(val.matchAll(/{{\s*([A-Za-z0-9_.-]+)\s*}}/g));
        if (matches.length === 0) {
            return <span className="text-gray-700 dark:text-gray-200 text-sm">{val}</span>;
        }
        const parts: ReactNode[] = [];
        let lastIndex = 0;
        matches.forEach((match, i) => {
            const fullMatch = match[0];
            const varName = match[1];
            const start = match.index ?? 0;
            if (start > lastIndex) {
                parts.push(<span key={`t${i}`} className="text-gray-700 dark:text-gray-200">{val.slice(lastIndex, start)}</span>);
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
        if (lastIndex < val.length) {
            parts.push(<span key="tail" className="text-gray-700 dark:text-gray-200">{val.slice(lastIndex)}</span>);
        }
        return <>{parts}</>;
    };

    const hasVars = /{{\s*[A-Za-z0-9_.-]+\s*}}/.test(value || "");
    const suggestions = getValueSuggestions(value);

    return (
        <div className="relative cursor-text w-full" onClick={() => inputRef.current?.focus()}>
            <input
                ref={inputRef}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                className={`${className} ${!isFocused && hasVars ? 'opacity-0 absolute inset-0 w-full h-full pointer-events-none' : ''}`}
            />
            {!isFocused && hasVars && (
                <div className="p-2 border border-gray-300 dark:border-gray-700 rounded text-sm min-h-[38px] flex items-center flex-wrap gap-0.5 bg-gray-50/50 dark:bg-gray-900/30">
                    {renderValueOverlay(value)}
                </div>
            )}
            {isFocused && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-1 max-h-40 overflow-y-auto">
                    {suggestions.map((sv) => (
                        <button
                            key={sv}
                            type="button"
                            className="w-full text-left px-2 py-1 rounded-md text-xs text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-mono cursor-pointer"
                            onMouseDown={() => onChange(sv)}
                        >
                            {sv}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

interface EnvironmentTextareaProps {
    placeholder: string;
    value: string;
    onChange: (val: string) => void;
    variableKeys: string[];
    variablePreview: Record<string, string>;
    className?: string;
}

const EnvironmentTextarea = ({
    placeholder,
    value,
    onChange,
    variableKeys,
    variablePreview,
    className = ""
}: EnvironmentTextareaProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const getValueSuggestions = (val: string) => {
        const normalized = (val || "").trim().toLowerCase();
        const envValues = (variableKeys || []).map((envKey) => `{{${envKey}}}`);
        return envValues
            .filter((item) => item.toLowerCase().includes(normalized))
            .slice(0, 8);
    };

    const renderValueOverlay = (val: string) => {
        const matches = Array.from(val.matchAll(/{{\s*([A-Za-z0-9_.-]+)\s*}}/g));
        if (matches.length === 0) {
            return <span className="text-gray-700 dark:text-gray-200 text-sm whitespace-pre-wrap">{val}</span>;
        }
        const parts: ReactNode[] = [];
        let lastIndex = 0;
        matches.forEach((match, i) => {
            const fullMatch = match[0];
            const varName = match[1];
            const start = match.index ?? 0;
            if (start > lastIndex) {
                parts.push(<span key={`t${i}`} className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{val.slice(lastIndex, start)}</span>);
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
        if (lastIndex < val.length) {
            parts.push(<span key="tail" className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{val.slice(lastIndex)}</span>);
        }
        return <>{parts}</>;
    };

    const hasVars = /{{\s*[A-Za-z0-9_.-]+\s*}}/.test(value || "");
    const suggestions = getValueSuggestions(value);

    return (
        <div className="relative cursor-text w-full flex-1 flex flex-col" onClick={() => textareaRef.current?.focus()}>
            <textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                className={`${className} ${!isFocused && hasVars ? 'opacity-0 absolute inset-0 w-full h-full pointer-events-none' : ''}`}
            />
            {!isFocused && hasVars && (
                <div className="w-full flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded text-sm min-h-[60px] flex flex-wrap gap-0.5 bg-gray-50/50 dark:bg-gray-900/30 overflow-y-auto align-top items-start">
                    {renderValueOverlay(value)}
                </div>
            )}
            {isFocused && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-1 max-h-40 overflow-y-auto">
                    {suggestions.map((sv) => (
                        <button
                            key={sv}
                            type="button"
                            className="w-full text-left px-2 py-1 rounded-md text-xs text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-mono cursor-pointer"
                            onMouseDown={() => onChange(sv)}
                        >
                            {sv}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const AuthorizationTab = ({ auth, onUpdate, variableKeys = [], variablePreview = {} }: AuthorizationTabProps) => {
    const currentType = auth?.auth_type || 'none';
    let authData: any = {};
    if (auth && auth.auth_data) {
        try {
            authData = typeof auth.auth_data === 'string' ? JSON.parse(auth.auth_data) : auth.auth_data;
        } catch (e) {
            authData = {};
        }
    }

    const handleTypeChange = (newType: string) => {
        onUpdate({
            auth_type: newType,
            auth_data: (newType === 'apikey') ? { add_to: 'header' } : {}
        });
    };

    const handleDataChange = (field: string, value: string) => {
        onUpdate({
            ...auth,
            auth_data: {
                ...authData,
                [field]: value
            }
        });
    };

    return (
        <div className="flex flex-col h-full pl-2">
            <div className="mb-6 flex items-center gap-4">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Auth Type</label>
                <Select
                    value={currentType}
                    onChange={handleTypeChange}
                    options={AUTH_TYPES}
                    className="w-48"
                />
            </div>

            <div className="flex-1">
                {currentType === 'none' && (
                    <div className="text-gray-500 text-sm">
                        This request does not use any authorization.
                    </div>
                )}

                {currentType === 'bearer' && (
                    <div className="flex flex-col gap-2 max-w-2xl h-full pb-4">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Token</label>
                        <EnvironmentTextarea
                            placeholder="Bearer Token"
                            value={authData.token || ''}
                            onChange={(val) => handleDataChange('token', val)}
                            variableKeys={variableKeys}
                            variablePreview={variablePreview}
                            className="w-full flex-1 p-2 bg-transparent border border-gray-300 dark:border-gray-700 focus:border-[#0E61B1] dark:focus:border-blue-500 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none font-mono"
                        />
                    </div>
                )}

                {currentType === 'basic' && (
                    <div className="flex flex-col gap-4 max-w-md">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Username</label>
                            <EnvironmentInput
                                placeholder="Username"
                                value={authData.username || ''}
                                onChange={(val) => handleDataChange('username', val)}
                                variableKeys={variableKeys}
                                variablePreview={variablePreview}
                                className="w-full p-2 bg-transparent border border-gray-300 dark:border-gray-700 focus:border-[#0E61B1] dark:focus:border-blue-500 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Password</label>
                            <EnvironmentInput
                                type="password"
                                placeholder="Password"
                                value={authData.password || ''}
                                onChange={(val) => handleDataChange('password', val)}
                                variableKeys={variableKeys}
                                variablePreview={variablePreview}
                                className="w-full p-2 bg-transparent border border-gray-300 dark:border-gray-700 focus:border-[#0E61B1] dark:focus:border-blue-500 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
                            />
                        </div>
                    </div>
                )}

                {currentType === 'apikey' && (
                    <div className="flex flex-col gap-4 max-w-md">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Key</label>
                            <EnvironmentInput
                                placeholder="API Key name"
                                value={authData.key || ''}
                                onChange={(val) => handleDataChange('key', val)}
                                variableKeys={variableKeys}
                                variablePreview={variablePreview}
                                className="w-full p-2 bg-transparent border border-gray-300 dark:border-gray-700 focus:border-[#0E61B1] dark:focus:border-blue-500 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Value</label>
                            <EnvironmentInput
                                placeholder="API Key value"
                                value={authData.value || ''}
                                onChange={(val) => handleDataChange('value', val)}
                                variableKeys={variableKeys}
                                variablePreview={variablePreview}
                                className="w-full p-2 bg-transparent border border-gray-300 dark:border-gray-700 focus:border-[#0E61B1] dark:focus:border-blue-500 rounded text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Add to</label>
                            <Select
                                value={authData.add_to || 'header'}
                                onChange={(val) => handleDataChange('add_to', val)}
                                options={[
                                    { value: 'header', label: 'Header' },
                                    { value: 'query', label: 'Query Params' }
                                ]}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
