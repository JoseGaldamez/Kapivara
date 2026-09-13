import type { Environment, EnvironmentVariable } from "@/types";
import { FolderKanban, Globe, RefreshCw } from "lucide-react";

interface ResolvedVariablesViewProps {
    activeProjectEnvironment?: Environment;
    activeGlobalEnvironment?: Environment;
    projectVariables: EnvironmentVariable[];
    globalVariables: EnvironmentVariable[];
    resolvedVariables: Record<string, string>;
    isRefreshing: boolean;
    onRefresh: () => void;
}

const ScopeSummary = ({ icon: Icon, label, environment, count }: {
    icon: typeof FolderKanban;
    label: string;
    environment?: Environment;
    count: number;
}) => (
    <div className="rounded-lg border border-[#eee6df] bg-[#faf6f1] p-3.5 dark:border-white/6 dark:bg-[#1e2026]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8f796c] dark:text-[#8f8b86]"><Icon size={15} /> {label}</div>
        <div className="mt-2 text-sm font-bold text-[#2c211c] dark:text-[#f8eee5]">{environment?.name ?? "None (inactive)"}</div>
        <div className="mt-1 text-[11px] text-[#7e695d] dark:text-[#9e9791]">{count} active variables</div>
    </div>
);

export const ResolvedVariablesView = ({
    activeProjectEnvironment,
    activeGlobalEnvironment,
    projectVariables,
    globalVariables,
    resolvedVariables,
    isRefreshing,
    onRefresh,
}: ResolvedVariablesViewProps) => (
    <div className="space-y-6">
        <div className="rounded-xl border border-[#ded7ce] bg-[#fffdf9] p-6 shadow-[0_6px_20px_rgba(62,47,37,0.04)] dark:border-white/8 dark:bg-[#18191e]">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold tracking-[-0.02em] text-[#2c211c] dark:text-[#f8eee5]">Active Runtime Context</h2>
                    <p className="mt-1 text-xs text-[#7e695d] dark:text-[#9e9791]">Variables currently evaluated and injected into requests for this workspace.</p>
                </div>
                <button type="button" onClick={onRefresh} disabled={isRefreshing} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#d8d0c7] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#3d2a21] transition-colors hover:bg-[#f8f4ef] disabled:cursor-wait disabled:opacity-60 dark:border-white/10 dark:bg-[#202127] dark:text-[#f8eee5]">
                    <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} /> Refresh
                </button>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ScopeSummary icon={FolderKanban} label="Active Project Environment" environment={activeProjectEnvironment} count={projectVariables.length} />
                <ScopeSummary icon={Globe} label="Active Global Environment" environment={activeGlobalEnvironment} count={globalVariables.length} />
            </div>
        </div>

        <div className="rounded-xl border border-[#ded7ce] bg-[#fffdf9] p-6 shadow-[0_6px_20px_rgba(62,47,37,0.04)] dark:border-white/8 dark:bg-[#18191e]">
            <h2 className="mb-4 text-sm font-semibold tracking-[-0.02em] text-[#2c211c] dark:text-[#f8eee5]">Resolved Variables List</h2>
            {Object.keys(resolvedVariables).length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8f796c] dark:text-[#8f8b86]">
                    No variables are currently active. Activate an environment above to use variables like <code className="rounded bg-[#eee6df] px-1.5 py-0.5 font-mono dark:bg-white/8">{"{{my_var}}"}</code> in your requests.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead><tr className="border-b border-[#eee6df] text-[11px] font-bold uppercase tracking-wider text-[#8f796c] dark:border-white/7 dark:text-[#8f8b86]"><th className="pb-2">Variable</th><th className="pb-2 pl-4">Effective Value</th><th className="pb-2 pl-4">Source Scope</th></tr></thead>
                        <tbody className="divide-y divide-[#f2ebe3] font-mono text-xs dark:divide-white/5">
                            {Object.entries(resolvedVariables).map(([key, value]) => {
                                const inProject = projectVariables.some((variable) => variable.key === key);
                                const inGlobal = globalVariables.some((variable) => variable.key === key);
                                return (
                                    <tr key={key} className="hover:bg-[#faf6f0] dark:hover:bg-white/2">
                                        <td className="py-2.5 font-bold text-[#245f92] dark:text-blue-400">{`{{${key}}}`}</td>
                                        <td className="py-2.5 pl-4 text-[#3d2a21] dark:text-[#e4dad3]">{value}</td>
                                        <td className="py-2.5 pl-4 font-sans">
                                            {inProject && inGlobal ? <span className="inline-flex rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">Project (overrides Global)</span>
                                                : inProject ? <span className="inline-flex rounded bg-[#e8eef4] px-2 py-0.5 text-[10px] font-semibold text-[#245f92] dark:bg-blue-500/15 dark:text-blue-400">Project</span>
                                                : inGlobal ? <span className="inline-flex rounded bg-[#e8efea] px-2 py-0.5 text-[10px] font-semibold text-[#367557] dark:bg-emerald-500/15 dark:text-emerald-400">Global</span>
                                                : <span className="text-[#a09084] dark:text-[#77736f]">Unknown</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
);
