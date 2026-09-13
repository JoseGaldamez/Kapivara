import { METHODS_COLORS } from '@/utils/methods.constants';
import { Send, ChevronDown, AlertCircle } from 'lucide-react';
import { Select } from '@/components/common/Select';
import { VarBadge } from '@/components/common/VarBadge';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Environment, EnvironmentVariable } from '@/types';
import { environmentController } from '@/controllers/environment.controller';
import { resolveTemplateString } from '@/utils/environment-resolver';
import { toast } from 'react-toastify';
import { useDismissibleLayer } from '@/hooks/useDismissibleLayer';

interface FormRequestSectionProps {
    method: string;
    url: string;
    isLoading: boolean;
    handleSend: () => void;
    handleMethodChange: (method: string) => void;
    handleUrlChange: (url: string) => void;
    variableKeys?: string[];
    variablePreview?: Record<string, string>;
    projectId?: string;
    activeProjectEnvironmentId?: string | null;
    activeGlobalEnvironmentId?: string | null;
    projectEnvironments?: Environment[];
    globalEnvironments?: Environment[];
    onVariableAdded?: () => void;
}

interface AddVarState {
    name: string;
    selectedEnvId: string;
    value: string;
    isUpdate: boolean;
    userEditedValue: boolean;
    userEditedEnv: boolean;
}

const METHODS = Object.keys(METHODS_COLORS);

export const FormRequestSection = ({
    method, url, isLoading, handleSend, handleMethodChange, handleUrlChange,
    variableKeys = [], variablePreview = {},
    projectId, activeProjectEnvironmentId = null, activeGlobalEnvironmentId = null,
    projectEnvironments = [], globalEnvironments = [], onVariableAdded
}: FormRequestSectionProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [addVarState, setAddVarState] = useState<AddVarState | null>(null);
    const [showBaseUrlWarning, setShowBaseUrlWarning] = useState(false);

    // Auto-focus and place cursor immediately after {{baseUrl}}/ on new request
    useEffect(() => {
        if (url === "{{baseUrl}}/") {
            setIsFocused(true);
            const timer = setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    const len = inputRef.current.value.length;
                    inputRef.current.setSelectionRange(len, len);
                }
            }, 60);
            return () => clearTimeout(timer);
        }
    }, [url]);

    // Hide warning if baseUrl is now populated or URL doesn't use {{baseUrl}}
    useEffect(() => {
        if (!url.includes("{{baseUrl}}") || (variablePreview["baseUrl"] && variablePreview["baseUrl"].trim() !== "")) {
            setShowBaseUrlWarning(false);
        }
    }, [url, variablePreview]);

    const detectedVariables = useMemo(() => Array.from(url.matchAll(/{{\s*([A-Za-z0-9_.-]+)\s*}}/g)), [url]);

    const findEnvForVariable = useCallback((varName: string): { envId: string; currentValue: string } => {
        const activeProjectEnv = projectEnvironments.find(e => e.id === activeProjectEnvironmentId);
        if (activeProjectEnv) {
            try {
                const vars: EnvironmentVariable[] = activeProjectEnv.variables ? JSON.parse(activeProjectEnv.variables) : [];
                const found = vars.find(v => v.key === varName && v.enabled === 1);
                if (found) return { envId: activeProjectEnv.id, currentValue: found.value };
            } catch { /* skip */ }
        }
        const activeGlobalEnv = globalEnvironments.find(e => e.id === activeGlobalEnvironmentId);
        if (activeGlobalEnv) {
            try {
                const vars: EnvironmentVariable[] = activeGlobalEnv.variables ? JSON.parse(activeGlobalEnv.variables) : [];
                const found = vars.find(v => v.key === varName && v.enabled === 1);
                if (found) return { envId: activeGlobalEnv.id, currentValue: found.value };
            } catch { /* skip */ }
        }
        return { envId: activeProjectEnvironmentId || activeGlobalEnvironmentId || '', currentValue: '' };
    }, [projectEnvironments, globalEnvironments, activeProjectEnvironmentId, activeGlobalEnvironmentId]);

    // Recalculate addVarState when active environment changes
    useEffect(() => {
        setAddVarState(prev => {
            if (!prev) return null;
            const { envId, currentValue } = findEnvForVariable(prev.name);
            const selectedEnvId = prev.userEditedEnv ? prev.selectedEnvId : envId;
            const value = prev.userEditedValue ? prev.value : currentValue;
            if (selectedEnvId === prev.selectedEnvId && value === prev.value) return prev;
            return {
                ...prev,
                selectedEnvId,
                value,
            };
        });
    }, [findEnvForVariable]);

    const allEnvironmentOptions = useMemo(() => [
        { value: '', label: 'Select environment...' },
        ...projectEnvironments.map(e => ({ value: e.id, label: `Project: ${e.name}` })),
        ...globalEnvironments.map(e => ({ value: e.id, label: `Global: ${e.name}` })),
    ], [globalEnvironments, projectEnvironments]);

    const handleAddVariable = async () => {
        if (!addVarState || !addVarState.selectedEnvId || !projectId) {
            toast.warning('Select an environment first');
            return;
        }
        const allEnvs = [...projectEnvironments, ...globalEnvironments];
        const env = allEnvs.find(e => e.id === addVarState.selectedEnvId);
        if (!env) return;

        try {
            let existingVars: EnvironmentVariable[] = [];
            try { existingVars = env.variables ? JSON.parse(env.variables) : []; } catch { existingVars = []; }
            const newVar: EnvironmentVariable = { id: crypto.randomUUID(), key: addVarState.name, value: addVarState.value, enabled: 1 };
            const updatedVars = [...existingVars.filter(v => v.key !== addVarState.name), newVar];
            const scope = env.project_id ? 'project' as const : 'global' as const;
            await environmentController.updateEnvironmentVariables(scope, env.id, updatedVars, scope === 'project' ? projectId : undefined);
            toast.success(`Variable {{${addVarState.name}}} ${addVarState.isUpdate ? 'updated' : 'added'}`);
            setAddVarState(null);
            onVariableAdded?.();
        } catch {
            toast.error('Failed to add variable');
        }
    };

    const renderHighlightedUrl = () => {
        if (!url) {
            return <span className="text-gray-400 dark:text-gray-500">Enter request URL</span>;
        }
        if (detectedVariables.length === 0) {
            return <span className="text-gray-700 dark:text-gray-200">{url}</span>;
        }

        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        detectedVariables.forEach((match, index) => {
            const fullMatch = match[0];
            const variableName = match[1];
            const startIndex = match.index ?? 0;

            if (startIndex > lastIndex) {
                parts.push(
                    <span key={`text-${index}`} className="text-gray-700 dark:text-gray-200">
                        {url.slice(lastIndex, startIndex)}
                    </span>
                );
            }

            const resolvedValue = variablePreview[variableName];
            const exists = variableName in variablePreview;

            parts.push(
                <span key={`var-${index}`} className="inline-flex items-center">
                    <VarBadge
                        name={variableName}
                        exists={exists}
                        resolvedValue={resolvedValue}
                        onClickMissing={() => setAddVarState({ name: variableName, selectedEnvId: '', value: '', isUpdate: false, userEditedValue: false, userEditedEnv: false })}
                        onClickExists={() => {
                            const { envId, currentValue } = findEnvForVariable(variableName);
                            setAddVarState({ name: variableName, selectedEnvId: envId, value: currentValue, isUpdate: true, userEditedValue: false, userEditedEnv: false });
                        }}
                    />
                </span>
            );

            lastIndex = startIndex + fullMatch.length;
        });

        if (lastIndex < url.length) {
            parts.push(
                <span key="text-tail" className="text-gray-700 dark:text-gray-200">
                    {url.slice(lastIndex)}
                </span>
            );
        }

        return parts;
    };

    const [isMethodMenuOpen, setIsMethodMenuOpen] = useState(false);
    const methodMenuRef = useDismissibleLayer<HTMLDivElement>({
        isOpen: isMethodMenuOpen,
        onDismiss: () => setIsMethodMenuOpen(false),
    });

    const onSendClick = () => {
        if (!url) return;

        // Check if url uses {{baseUrl}} and baseUrl is empty or undefined
        if (url.includes("{{baseUrl}}")) {
            const baseUrlVal = variablePreview["baseUrl"];
            if (!baseUrlVal || !baseUrlVal.trim()) {
                setShowBaseUrlWarning(true);
                return;
            }
        }

        setShowBaseUrlWarning(false);
        handleSend();
    };

    const activeProjectEnv = projectEnvironments.find(e => e.id === activeProjectEnvironmentId);
    const activeEnvName = activeProjectEnv ? activeProjectEnv.name : "Local";

    const resolvedFullUrl = resolveTemplateString(url, variablePreview);
    const hasResolvedDifference = url.includes("{{") && resolvedFullUrl !== url && !showBaseUrlWarning && !!variablePreview["baseUrl"]?.trim();

    return (
        <div className="p-4 border-b border-[#ded7ce]/60 dark:border-white/8 bg-[#fffdf9] dark:bg-[#18191e] transition-colors">
            <div className="flex items-center gap-2">
                {/* Method selector button with dropdown */}
                <div className="relative shrink-0" ref={methodMenuRef}>
                    <button
                        type="button"
                        onClick={() => setIsMethodMenuOpen((prev) => !prev)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#ded7ce] dark:border-white/10 bg-white dark:bg-[#20222a] hover:bg-[#f6f2ec] dark:hover:bg-[#262833] text-xs font-bold font-mono transition-colors cursor-pointer shadow-xs ${
                            METHODS_COLORS[method as keyof typeof METHODS_COLORS] || "text-[#1a1714] dark:text-[#f4eadf]"
                        }`}
                    >
                        <span>{method === "DELETE" ? "DEL" : method}</span>
                        <ChevronDown size={13} className={`text-[#8a7e72] transition-transform duration-150 ${isMethodMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isMethodMenuOpen && (
                        <div className="absolute left-0 mt-1 z-50 w-32 bg-[#fffdf9] dark:bg-[#1c1d24] border border-[#ded7ce] dark:border-white/10 rounded-xl shadow-xl p-1 animate-in fade-in slide-in-from-top-1 duration-150">
                            {METHODS.map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => {
                                        handleMethodChange(m);
                                        setIsMethodMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono text-left hover:bg-[#f6f2ec] dark:hover:bg-white/10 cursor-pointer transition-colors ${
                                        METHODS_COLORS[m as keyof typeof METHODS_COLORS]
                                    } ${method === m ? "bg-[#f6f2ec] dark:bg-white/10" : ""}`}
                                >
                                    {m === "DELETE" ? "DEL" : m}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* URL input box */}
                <div
                    className="flex-1 min-w-0 relative flex items-center bg-white dark:bg-[#121316] rounded-xl px-3.5 py-2 border border-[#ded7ce] dark:border-white/10 focus-within:border-[#0066ff] focus-within:ring-2 focus-within:ring-[#0066ff]/15 transition-all cursor-text shadow-xs"
                    onClick={() => inputRef.current?.focus()}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={url}
                        list="environment-variable-suggestions-url"
                        onChange={(e) => handleUrlChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") onSendClick();
                        }}
                        placeholder="{{baseUrl}}/endpoint"
                        className={`w-full bg-transparent text-xs font-mono focus:outline-none text-[#1a1714] dark:text-[#f4eadf] placeholder:text-[#8a7e72] dark:placeholder:text-[#6e665d] ${
                            !isFocused ? "opacity-0 pointer-events-none absolute inset-0 h-full px-3.5 py-2" : ""
                        }`}
                    />

                    {!isFocused && (
                        <div
                            className="absolute inset-0 flex items-center px-3.5 text-xs font-mono overflow-hidden whitespace-nowrap"
                            onClick={() => inputRef.current?.focus()}
                        >
                            {renderHighlightedUrl()}
                        </div>
                    )}

                    {!isFocused && <div className="invisible text-xs font-mono py-0.5">&#8203;</div>}

                    <datalist id="environment-variable-suggestions-url">
                        {variableKeys.map((key) => (
                            <option key={key} value={`{{${key}}}`} label={variablePreview[key] || ""} />
                        ))}
                    </datalist>
                </div>

                {/* Send Button */}
                <button
                    onClick={onSendClick}
                    disabled={isLoading}
                    className={`bg-[#0066ff] hover:bg-[#0055d4] text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] ${
                        isLoading ? "animate-pulse" : ""
                    }`}
                >
                    <Send size={13} className="shrink-0" />
                    <span>{isLoading ? "Sending..." : "Send"}</span>
                </button>
            </div>

            {/* Resolved URL Preview */}
            {hasResolvedDifference && (
                <div className="mt-2 px-1 flex items-center gap-1.5 text-[11px] font-mono text-[#8a7e72] dark:text-[#a89f91] select-none animate-in fade-in duration-150">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8a7e72]/80">Resolved:</span>
                    <span className="truncate text-[#342b26] dark:text-[#d8cec8]">{resolvedFullUrl}</span>
                </div>
            )}

            {/* Warning banner when baseUrl is empty or undefined */}
            {showBaseUrlWarning && (
                <div className="mt-2.5 p-3 rounded-xl border border-amber-300/80 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>
                            <strong>baseUrl</strong> is not defined for the <strong>{activeEnvName}</strong> environment.
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            const envId = activeProjectEnvironmentId || projectEnvironments[0]?.id || "";
                            setAddVarState({
                                name: "baseUrl",
                                selectedEnvId: envId,
                                value: "",
                                isUpdate: true,
                                userEditedValue: false,
                                userEditedEnv: false
                            });
                            setShowBaseUrlWarning(false);
                        }}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                        Set baseUrl
                    </button>
                </div>
            )}

            {/* Inline "Add variable to environment" form */}
            {addVarState && (
                <div className="mt-2 p-3 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 flex flex-col gap-2">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        {addVarState.isUpdate ? 'Update' : 'Add'} variable{' '}
                        <code className="text-violet-600 dark:text-violet-400 font-mono">{`{{${addVarState.name}}}`}</code>
                    </p>
                    <div className="flex gap-2 flex-wrap">
                        <div className="w-52">
                            <Select
                                value={addVarState.selectedEnvId}
                                onChange={(v) => setAddVarState(prev => prev ? { ...prev, selectedEnvId: v, userEditedEnv: true } : null)}
                                options={allEnvironmentOptions}
                                className="w-full"
                            />
                        </div>
                        <input
                            value={addVarState.value}
                            onChange={(e) => setAddVarState(prev => prev ? { ...prev, value: e.target.value, userEditedValue: true } : null)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddVariable(); if (e.key === 'Escape') setAddVarState(null); }}
                            placeholder={addVarState.name === "baseUrl" ? "http://localhost:3000" : "Value"}
                            autoFocus
                            className="flex-1 min-w-32 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-violet-400"
                        />
                        <button
                            onClick={handleAddVariable}
                            className="px-4 py-1.5 text-sm bg-[#0E61B1] text-white rounded-lg hover:bg-[#0E61B1]/90 cursor-pointer"
                        >
                            {addVarState.isUpdate ? 'Update' : 'Add'}
                        </button>
                        <button
                            onClick={() => setAddVarState(null)}
                            className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
