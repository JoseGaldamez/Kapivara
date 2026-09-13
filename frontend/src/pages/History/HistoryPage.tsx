import { useConsoleStore } from "@/stores/console.store";
import { Clock3, History, SearchX, Trash2 } from "lucide-react";
import { ProjectPageHeader } from "@/components/common/ProjectPageHeader";
import { Project } from "@/types";

interface HistoryPageProps {
    project: Project;
    searchTerm: string;
    onNavigateToRequests: () => void;
}

const statusTone = (status: number) => {
    if (status >= 200 && status < 300) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
    if (status >= 400) return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400";
    return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
};

export const HistoryPage = ({ project, searchTerm, onNavigateToRequests }: HistoryPageProps) => {
    const entries = useConsoleStore((state) => state.entries);
    const clear = useConsoleStore((state) => state.clear);
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredEntries = normalizedSearch
        ? entries.filter((entry) =>
              [entry.requestName, entry.method, entry.url, String(entry.status)].some((value) =>
                  value.toLowerCase().includes(normalizedSearch)
              )
          )
        : entries;

    const clearAction = entries.length > 0 ? (
        <button
            type="button"
            onClick={clear}
            className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#d8d0c7] bg-white px-3.5 text-xs font-semibold text-[#62564f] shadow-xs transition-colors hover:bg-[#f8f4ef] hover:text-[#2c211c] dark:border-white/10 dark:bg-[#202127] dark:text-[#c2b9b3] dark:hover:bg-white/8 dark:hover:text-white"
        >
            <Trash2 size={14} /> Clear history
        </button>
    ) : null;

    return (
        <main className="h-full overflow-y-auto overscroll-contain bg-[#f4eadf] text-[#2c211c] transition-colors dark:bg-[#101115] dark:text-[#f8eee5]">
            <div className="mx-auto w-full max-w-[1120px] px-6 py-7 lg:px-10 lg:py-8">
                <ProjectPageHeader
                    title="Request History"
                    description="Session request activity and responses for"
                    projectName={project.name}
                    icon={History}
                    onNavigateToRequests={onNavigateToRequests}
                    actions={clearAction}
                />

                <section className="overflow-hidden rounded-xl border border-[#ded7ce] bg-[#fffdf9] shadow-[0_6px_20px_rgba(62,47,37,0.04)] dark:border-white/8 dark:bg-[#18191e]">
                    {filteredEntries.length > 0 ? (
                        filteredEntries.map((entry, index) => (
                            <article
                                key={entry.id}
                                className={`grid grid-cols-[72px_minmax(0,1fr)_96px_90px_145px] items-center gap-3 px-5 py-3.5 ${
                                    index > 0 ? "border-t border-[#eee6df] dark:border-white/6" : ""
                                }`}
                            >
                                <span className="font-mono text-xs font-bold text-[#0E61B1] dark:text-blue-400">
                                    {entry.method}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-[#2c211c] dark:text-[#f8eee5]">
                                        {entry.requestName || "Untitled request"}
                                    </p>
                                    <p className="mt-0.5 truncate font-mono text-xs text-[#8f796c] dark:text-[#8f8b86]">
                                        {entry.url}
                                    </p>
                                </div>
                                <span className={`w-fit rounded-md px-2.5 py-1 text-xs font-semibold ${statusTone(entry.status)}`}>
                                    {entry.status}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#7e695d] dark:text-[#9e9791]">
                                    <Clock3 size={13} /> {entry.time_ms} ms
                                </span>
                                <time className="text-right font-mono text-[11px] text-[#9a8579] dark:text-[#7f7a76]">
                                    {new Date(entry.timestamp).toLocaleTimeString()}
                                </time>
                            </article>
                        ))
                    ) : (
                        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                            {normalizedSearch ? (
                                <SearchX size={32} className="text-[#aa998e] dark:text-[#77736f]" />
                            ) : (
                                <History size={32} className="text-[#aa998e] dark:text-[#77736f]" />
                            )}
                            <h2 className="mt-4 text-base font-semibold text-[#3d2a21] dark:text-[#e4dad3]">
                                {normalizedSearch ? "No request matches that search" : "No requests sent yet"}
                            </h2>
                            <p className="mt-1.5 max-w-sm text-xs text-[#856f62] dark:text-[#9e9791]">
                                {normalizedSearch
                                    ? "Try searching by request name, method, URL, or status code."
                                    : "Responses will appear here as you send requests in this session."}
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};
