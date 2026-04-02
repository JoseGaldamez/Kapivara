import { METHODS_COLORS } from '@/utils/methods.constants';
import { Play, Save } from 'lucide-react';
import { Select } from '@/components/common/Select';
import { VarBadge } from '@/components/common/VarBadge';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Environment, EnvironmentVariable } from '@/types';
import { environmentController } from '@/controllers/environment.controller';
import { toast } from 'react-toastify';

interface FormRequestSectionProps {
    method: string;
    url: string;
    isLoading: boolean;
    handleSend: () => void;
    handleSave: () => void;
    handleMethodChange: (method: string) => void;
    handleUrlChange: (url: string) => void;
    isDirty?: boolean;
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
const METHOD_OPTIONS = METHODS.map(m => ({
    label: m,
    value: m,
    className: METHODS_COLORS[m as keyof typeof METHODS_COLORS]
}));

export const FormRequestSection = ({
    method, url, isLoading, handleSend, handleSave, handleMethodChange, handleUrlChange,
    isDirty, variableKeys = [], variablePreview = {},
    projectId, activeProjectEnvironmentId = null, activeGlobalEnvironmentId = null,
    projectEnvironments = [], globalEnvironments = [], onVariableAdded
}: FormRequestSectionProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [addVarState, setAddVarState] = useState<AddVarState | null>(null);

    const detectedVariables = Array.from(url.matchAll(/{{\s*([A-Za-z0-9_.-]+)\s*}}/g));

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
        if (!addVarState) return;
        const { envId, currentValue } = findEnvForVariable(addVarState.name);
        setAddVarState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                selectedEnvId: prev.userEditedEnv ? prev.selectedEnvId : envId,
                value: prev.userEditedValue ? prev.value : currentValue,
            };
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeProjectEnvironmentId, activeGlobalEnvironmentId]);

    const allEnvironmentOptions = [
        { value: '', label: 'Select environment...' },
        ...projectEnvironments.map(e => ({ value: e.id, label: `Project: ${e.name}` })),
        ...globalEnvironments.map(e => ({ value: e.id, label: `Global: ${e.name}` })),
    ];

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

    return (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-transparent focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-gray-900 transition-all min-w-0">
                    <Select
                        value={method}
                        onChange={handleMethodChange}
                        options={METHOD_OPTIONS}
                        className="w-28 font-bold text-sm"
                    />
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

                    {/* URL area: editable input or highlighted overlay */}
                    <div
                        className="flex-1 min-w-0 relative cursor-text"
                        onClick={() => inputRef.current?.focus()}
                    >
                        {/* Actual input - always in DOM for focus, invisible when not focused */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={url}
                            list="environment-variable-suggestions-url"
                            onChange={(e) => handleUrlChange(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                            placeholder="Enter request URL"
                            className={`w-full bg-transparent text-sm focus:outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                                !isFocused ? 'opacity-0 pointer-events-none absolute inset-0 h-full' : ''
                            }`}
                        />

                        {/* Highlighted overlay - visible when not focused */}
                        {!isFocused && (
                            <div
                                className="absolute inset-0 flex items-center text-sm overflow-hidden whitespace-nowrap"
                                onClick={() => inputRef.current?.focus()}
                            >
                                {renderHighlightedUrl()}
                            </div>
                        )}

                        {/* Invisible spacer to maintain height when using overlay */}
                        {!isFocused && <div className="invisible text-sm py-0.5">&#8203;</div>}

                        <datalist id="environment-variable-suggestions-url">
                            {variableKeys.map((key) => (
                                <option key={key} value={`{{${key}}}`} label={variablePreview[key] || ''} />
                            ))}
                        </datalist>
                    </div>
                </div>

                <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="bg-[#0E61B1] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#0E61B1]/90 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    <Play size={16} fill="currentColor" /> {isLoading ? "Sending..." : "Send"}
                </button>
                <button
                    onClick={handleSave}
                    className={`p-2 rounded-lg transition-colors cursor-pointer relative ${isDirty ? 'text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#0E61B1] dark:hover:text-[#0E61B1]'}`}
                    title="Save Request"
                >
                    <Save size={20} />
                    {isDirty && (
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                    )}
                </button>
            </div>

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
                            placeholder="Value"
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
