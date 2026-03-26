import { useEffect, useMemo, useRef, useState } from 'react';
import { Environment, EnvironmentScope, EnvironmentVariable, RequestInfo } from '@/types';
import { useEnvironmentStore } from '@/stores/environment.store';
import { environmentController } from '@/controllers/environment.controller';
import { Select } from '@/components/common/Select';
import { toast } from 'react-toastify';
import { resolveTemplateString } from '@/utils/environment-resolver';

interface SettingsTabProps {
    projectId: string;
    request?: RequestInfo;
    isFullscreen?: boolean;
}

const EMPTY_ENVIRONMENTS: Environment[] = [];

const EMPTY_ROW = (): EnvironmentVariable => ({
    id: crypto.randomUUID(),
    key: '',
    value: '',
    enabled: 1
});

const parseVariables = (environment: Environment | undefined): EnvironmentVariable[] => {
    if (!environment?.variables) return [EMPTY_ROW()];

    try {
        const parsed = JSON.parse(environment.variables);
        if (!Array.isArray(parsed) || parsed.length === 0) return [EMPTY_ROW()];

        const normalized = parsed.map((item) => ({
            id: item.id || crypto.randomUUID(),
            key: item.key || '',
            value: item.value || '',
            enabled: item.enabled === 0 ? 0 : 1
        }));

        const last = normalized[normalized.length - 1];
        if (last.key || last.value) {
            normalized.push(EMPTY_ROW());
        }

        return normalized;
    } catch {
        return [EMPTY_ROW()];
    }
};

interface EnvironmentSectionProps {
    title: string;
    scope: EnvironmentScope;
    projectId: string;
    environments: Environment[];
    activeId: string | null;
    onEnvironmentChanged: () => Promise<void>;
}

const EnvironmentSection = ({ title, scope, projectId, environments, activeId, onEnvironmentChanged }: EnvironmentSectionProps) => {
            const loadedEnvironmentIdRef = useRef<string | null>(null);

    const [newEnvironmentName, setNewEnvironmentName] = useState('');
    const [renameName, setRenameName] = useState('');
    const [variables, setVariables] = useState<EnvironmentVariable[]>([EMPTY_ROW()]);

    const activeEnvironment = useMemo(() => {
        return environments.find((environment) => environment.id === activeId);
    }, [environments, activeId]);

    useEffect(() => {
        const nextEnvironmentId = activeEnvironment?.id || null;
        if (loadedEnvironmentIdRef.current === nextEnvironmentId) return;

        loadedEnvironmentIdRef.current = nextEnvironmentId;
        setRenameName(activeEnvironment?.name || '');
        setVariables(parseVariables(activeEnvironment));
    }, [activeEnvironment?.id]);

    const activeOptions = [
        { value: '__none__', label: 'None' },
        ...environments.map((environment) => ({ value: environment.id, label: environment.name }))
    ];

    const handleSetActive = async (value: string) => {
        const nextValue = value === '__none__' ? null : value;
        try {
            await environmentController.setActiveEnvironment(scope, nextValue, scope === 'project' ? projectId : undefined);
            if (scope === 'project') {
                await environmentController.loadProjectEnvironments(projectId);
            } else {
                await environmentController.loadGlobalEnvironments();
            }
            await onEnvironmentChanged();
        } catch (error) {
            console.error('Failed to set active environment:', error);
            toast.error('Failed to set active environment');
        }
    };

    const handleCreate = async () => {
        const cleanName = newEnvironmentName.trim();
        if (!cleanName) {
            toast.warning('Environment name is required');
            return;
        }

        try {
            await environmentController.createEnvironment(scope, cleanName, scope === 'project' ? projectId : undefined);
            setNewEnvironmentName('');
            await onEnvironmentChanged();
            toast.success('Environment created');
        } catch (error) {
            console.error('Failed to create environment:', error);
            toast.error('Failed to create environment');
        }
    };

    const handleRename = async () => {
        if (!activeEnvironment) return;
        const cleanName = renameName.trim();
        if (!cleanName) {
            toast.warning('Environment name is required');
            return;
        }

        try {
            await environmentController.renameEnvironment(scope, activeEnvironment.id, cleanName, scope === 'project' ? projectId : undefined);
            await onEnvironmentChanged();
            toast.success('Environment renamed');
        } catch (error) {
            console.error('Failed to rename environment:', error);
            toast.error('Failed to rename environment');
        }
    };

    const handleDelete = async () => {
        if (!activeEnvironment) return;

        try {
            await environmentController.deleteEnvironment(scope, activeEnvironment.id, scope === 'project' ? projectId : undefined);
            await onEnvironmentChanged();
            toast.success('Environment deleted');
        } catch (error) {
            console.error('Failed to delete environment:', error);
            toast.error('Failed to delete environment');
        }
    };

    const handleSaveVariables = async () => {
        if (!activeEnvironment) return;

        const finalVariables = variables
            .filter((row) => row.key.trim() !== '')
            .map((row) => ({
                ...row,
                key: row.key.trim(),
                value: row.value || '',
                enabled: row.enabled === 0 ? 0 : 1
            }));

        try {
            await environmentController.updateEnvironmentVariables(scope, activeEnvironment.id, finalVariables, scope === 'project' ? projectId : undefined);
            await onEnvironmentChanged();
            toast.success('Variables saved');
        } catch (error) {
            console.error('Failed to save environment variables:', error);
            toast.error('Failed to save variables');
        }
    };

    const updateVariable = (id: string, field: keyof EnvironmentVariable, value: string | number) => {
        const next = variables.map((row) => row.id === id ? { ...row, [field]: value } : row);
        const last = next[next.length - 1];
        if (last.key || last.value) {
            next.push(EMPTY_ROW());
        }
        setVariables(next);
    };

    const removeVariable = (id: string) => {
        const next = variables.filter((row) => row.id !== id);
        if (next.length === 0 || next[next.length - 1].key || next[next.length - 1].value) {
            next.push(EMPTY_ROW());
        }
        setVariables(next);
    };

    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900/40">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">{title}</h3>

            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-2 mb-4">
                <div className="min-w-0">
                    <Select
                        value={activeId || '__none__'}
                        onChange={handleSetActive}
                        options={activeOptions}
                        className="w-full"
                    />
                </div>
                <input
                    value={newEnvironmentName}
                    onChange={(event) => setNewEnvironmentName(event.target.value)}
                    placeholder="New environment name"
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm w-full"
                />
                <button onClick={handleCreate} className="px-3 py-2 text-sm rounded-lg bg-[#0E61B1] text-white hover:bg-[#0E61B1]/90 cursor-pointer">
                    Create
                </button>
            </div>

            {activeEnvironment ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2 mb-3">
                        <input
                            value={renameName}
                            onChange={(event) => setRenameName(event.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm w-full"
                        />
                        <button onClick={handleRename} className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                            Rename
                        </button>
                        <button onClick={handleDelete} className="px-3 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-900/20 cursor-pointer">
                            Delete
                        </button>
                        <button onClick={handleSaveVariables} className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer">
                            Save variables
                        </button>
                    </div>

                    <div className="overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <th className="p-2 w-8"></th>
                                    <th className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Key</th>
                                    <th className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Value</th>
                                    <th className="p-2 w-8"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {variables.map((row, index) => {
                                    const isLast = index === variables.length - 1;

                                    return (
                                        <tr key={row.id} className="group border-b border-gray-100 dark:border-gray-800/50">
                                            <td className="p-2 text-center">
                                                {!isLast && (
                                                    <input
                                                        type="checkbox"
                                                        checked={row.enabled === 1}
                                                        onChange={(event) => updateVariable(row.id, 'enabled', event.target.checked ? 1 : 0)}
                                                    />
                                                )}
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    value={row.key}
                                                    placeholder="variable_name"
                                                    onChange={(event) => updateVariable(row.id, 'key', event.target.value)}
                                                    className="w-full p-2 bg-transparent border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded text-sm"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    value={row.value}
                                                    placeholder="value"
                                                    onChange={(event) => updateVariable(row.id, 'value', event.target.value)}
                                                    className="w-full p-2 bg-transparent border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded text-sm"
                                                />
                                            </td>
                                            <td className="p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!isLast && (
                                                    <button
                                                        onClick={() => removeVariable(row.id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                    >
                                                        x
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Select an environment to edit variables.</p>
            )}
        </div>
    );
};

export const SettingsTab = ({ projectId, request, isFullscreen = false }: SettingsTabProps) => {
    const projectEnvironments = useEnvironmentStore((state) => state.projectEnvironmentsByProject[projectId] ?? EMPTY_ENVIRONMENTS);
    const globalEnvironments = useEnvironmentStore((state) => state.globalEnvironments);
    const activeProjectEnvironmentId = useEnvironmentStore((state) => state.activeProjectEnvironmentIdByProject[projectId] || null);
    const activeGlobalEnvironmentId = useEnvironmentStore((state) => state.activeGlobalEnvironmentId);
    const [resolvedVariables, setResolvedVariables] = useState<Record<string, string>>({});
    const bootstrappedProjectIdRef = useRef<string | null>(null);
    const isBootstrappingRef = useRef(false);

    const refreshResolvedVariables = async () => {
        try {
            const resolved = await environmentController.getResolvedVariables(projectId);
            setResolvedVariables(resolved);
        } catch (error) {
            console.error('Failed to resolve environment variables:', error);
            setResolvedVariables({});
        }
    };

    useEffect(() => {
        if (bootstrappedProjectIdRef.current === projectId || isBootstrappingRef.current) return;

        const bootstrap = async () => {
            try {
                isBootstrappingRef.current = true;
                await environmentController.bootstrap(projectId);
                await refreshResolvedVariables();
                bootstrappedProjectIdRef.current = projectId;
            } catch (error) {
                console.error('Failed to bootstrap environments:', error);
            } finally {
                isBootstrappingRef.current = false;
            }
        };

        bootstrap();
    }, [projectId]);

    const resolvedUrlPreview = request?.url ? resolveTemplateString(request.url, resolvedVariables) : '';

    return (
        <div className={`p-4 flex flex-col gap-4 ${isFullscreen ? 'w-full max-w-none' : 'w-[420px] max-w-[420px]'}`}>
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900/40">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Resolved Variables Preview</h3>
                {Object.keys(resolvedVariables).length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">No active variables from global/project environments.</p>
                ) : (
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {Object.entries(resolvedVariables).map(([key, value]) => (
                            <div key={key} className="text-xs font-mono text-gray-700 dark:text-gray-200 break-all">
                                <span className="text-[#0E61B1]">{`{{${key}}}`}</span> = {value}
                            </div>
                        ))}
                    </div>
                )}

                {request?.url ? (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">URL preview</p>
                        <p className="text-xs font-mono text-gray-700 dark:text-gray-200 break-all">{resolvedUrlPreview || '-'}</p>
                    </div>
                ) : null}
            </div>

            <EnvironmentSection
                title="Project Environment"
                scope="project"
                projectId={projectId}
                environments={projectEnvironments}
                activeId={activeProjectEnvironmentId}
                onEnvironmentChanged={refreshResolvedVariables}
            />
            <EnvironmentSection
                title="Global Environment"
                scope="global"
                projectId={projectId}
                environments={globalEnvironments}
                activeId={activeGlobalEnvironmentId}
                onEnvironmentChanged={refreshResolvedVariables}
            />
        </div>
    );
};
