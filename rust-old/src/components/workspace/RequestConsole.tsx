import { useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown, Trash2, Terminal, ChevronRight } from 'lucide-react';
import { useConsoleStore, ConsoleEntry } from '@/stores/console.store';
import { METHODS_COLORS } from '@/utils/methods.constants';

/* ── helpers ── */
const statusColor = (s: number) => {
    if (s === 0) return 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    if (s < 300) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
    if (s < 400) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
};

const fmt = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const methodColor = (m: string) =>
    METHODS_COLORS[m as keyof typeof METHODS_COLORS] ?? 'text-gray-500';

/* ── entry row ── */
const EntryRow = ({ entry }: { entry: ConsoleEntry }) => {
    const [expanded, setExpanded] = useState(false);
    const [responseTab, setResponseTab] = useState<'body' | 'headers' | 'preview'>('body');

    const hasPreview = entry.isHtml;

    return (
        <div className="border-b border-gray-100 dark:border-gray-800">
            {/* Summary row */}
            <button
                onClick={() => setExpanded(p => !p)}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group"
            >
                <span className="shrink-0 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                    {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </span>

                <span className={`shrink-0 text-[11px] font-bold font-mono w-14 ${methodColor(entry.method)}`}>
                    {entry.method}
                </span>

                <span className={`shrink-0 text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded ${statusColor(entry.status)}`}>
                    {entry.status === 0 ? 'ERR' : entry.status}
                </span>

                <span className="flex-1 truncate text-xs text-gray-600 dark:text-gray-300 font-mono">
                    {entry.url}
                </span>

                <span className="shrink-0 text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                    {entry.time_ms > 0 ? `${entry.time_ms} ms` : '—'}
                </span>

                <span className="shrink-0 text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                    {fmt(entry.timestamp)}
                </span>
            </button>

            {/* Expanded detail */}
            {expanded && (
                <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    {/* Request name */}
                    <div className="px-4 pt-2 pb-1 text-[11px] text-gray-400 dark:text-gray-500">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">{entry.requestName}</span>
                        &nbsp;·&nbsp;{entry.statusText}
                    </div>

                    {/* Tab bar */}
                    <div className="flex gap-1 px-4 pt-1 pb-0 border-b border-gray-100 dark:border-gray-800">
                        {(['body', 'headers', 'preview'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setResponseTab(t)}
                                className={`px-3 py-1 text-[11px] font-medium rounded-t capitalize transition-colors ${
                                    responseTab === t
                                        ? 'bg-white dark:bg-gray-800 text-[#0E61B1] border border-b-white dark:border-gray-700 dark:border-b-gray-800 -mb-px'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                            >
                                {t}{t === 'preview' && hasPreview && (
                                    <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 align-middle" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="max-h-64 overflow-auto">
                        {responseTab === 'body' && (
                            <pre className="p-4 text-xs font-mono text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-all">
                                {entry.responseBody || <em className="text-gray-400">empty body</em>}
                            </pre>
                        )}
                        {responseTab === 'headers' && (
                            <table className="w-full text-xs font-mono">
                                <tbody>
                                    {Object.entries(entry.responseHeaders).length === 0 ? (
                                        <tr><td className="px-4 py-3 text-gray-400 italic">No headers</td></tr>
                                    ) : Object.entries(entry.responseHeaders).map(([k, v]) => (
                                        <tr key={k} className="border-b border-gray-100 dark:border-gray-800">
                                            <td className="px-4 py-1 text-violet-600 dark:text-violet-400 w-1/3 align-top">{k}</td>
                                            <td className="px-4 py-1 text-gray-700 dark:text-gray-200 break-all">{v}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {responseTab === 'preview' && (
                            entry.responseBody ? (
                                <iframe
                                    key={entry.id}
                                    srcDoc={entry.responseBody}
                                    sandbox="allow-same-origin allow-scripts"
                                    className="w-full border-0 bg-white"
                                    style={{ height: 220 }}
                                    title="HTML Preview"
                                />
                            ) : (
                                <div className="flex items-center justify-center py-8 text-xs text-gray-400 dark:text-gray-600">
                                    Empty response
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ── main panel ── */
export const RequestConsole = () => {
    const { entries, isOpen, toggle, clear } = useConsoleStore();
    const [panelHeight, setPanelHeight] = useState(260);
    const [isDragging, setIsDragging] = useState(false);

    const MIN_H = 120;
    const MAX_H = 520;

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    useEffect(() => {
        if (!isDragging) return;
        const onMove = (e: MouseEvent) => {
            // panel grows upward: bottom of viewport minus mouse Y
            const next = window.innerHeight - e.clientY;
            setPanelHeight(Math.min(MAX_H, Math.max(MIN_H, next)));
        };
        const onUp = () => setIsDragging(false);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [isDragging]);

    return (
        <div className="shrink-0 flex flex-col border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors">
            {/* Drag handle — only visible when open */}
            {isOpen && (
                <div
                    onMouseDown={onMouseDown}
                    className={`w-full h-1.5 cursor-ns-resize hover:bg-blue-400 dark:hover:bg-blue-600 transition-colors ${isDragging ? 'bg-blue-400 dark:bg-blue-600' : 'bg-transparent'}`}
                />
            )}

            {/* Console bar */}
            <button
                onClick={toggle}
                className="flex items-center gap-2 px-4 py-1.5 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors select-none"
            >
                <Terminal size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex-1">
                    Console
                    {entries.length > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#0E61B1] text-white text-[10px]">
                            {entries.length > 99 ? '99+' : entries.length}
                        </span>
                    )}
                </span>
                {isOpen ? (
                    <ChevronDown size={13} className="text-gray-400 shrink-0" />
                ) : (
                    <ChevronUp size={13} className="text-gray-400 shrink-0" />
                )}
            </button>

            {/* Entries list — fixed height, scrollable */}
            {isOpen && (
                <div className="flex flex-col overflow-hidden" style={{ height: panelHeight }}>
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-4 py-1 border-b border-gray-100 dark:border-gray-800 shrink-0">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">
                            {entries.length} {entries.length === 1 ? 'request' : 'requests'} · most recent first
                        </span>
                        {entries.length > 0 && (
                            <button
                                onClick={clear}
                                title="Clear console"
                                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                            >
                                <Trash2 size={11} /> Clear
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1">
                        {entries.length === 0 ? (
                            <div className="flex items-center justify-center py-8 text-xs text-gray-400 dark:text-gray-600">
                                No requests yet — send one to see it here
                            </div>
                        ) : (
                            entries.map((e) => <EntryRow key={e.id} entry={e} />)
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};



