import { Database, Trash2, RotateCcw, CheckCircle2 } from "lucide-react";
import { SettingCard } from "../components/SettingCard";
import { SettingRow } from "../components/SettingRow";
import { useConsoleStore } from "@/stores/console.store";
import { settingsController } from "@/controllers/settings.controller";
import { toast } from "react-toastify";

export const DataTab = () => {
    const consoleEntries = useConsoleStore((state) => state.entries);
    const clearConsole = useConsoleStore((state) => state.clear);

    const handleClearConsole = () => {
        clearConsole();
        toast.success("Session execution history cleared");
    };

    const handleResetSettings = () => {
        const defaults = {
            theme: "auto" as const,
            language: "es" as const,
            editor_font_size: 14,
            word_wrap: true,
            ssl_verification: true,
            request_timeout: 30000,
            follow_redirects: true,
            telemetry: false,
        };

        Object.entries(defaults).forEach(([key, val]) => {
            settingsController.updateSetting(key as any, val);
        });

        toast.success("Application settings restored to defaults");
    };

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-base font-semibold text-[#2c211c] dark:text-[#f8eee5]">
                    Data & Storage
                </h2>
                <p className="text-xs text-[#7e695d] dark:text-[#9e9791] mt-0.5">
                    Embedded SQLite database status, session memory, and maintenance.
                </p>
            </div>

            {/* Database Engine Status */}
            <SettingCard
                title="Database Status"
                description="Local storage architecture and persistence layer."
                badge={
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={13} /> Healthy
                    </span>
                }
            >
                <div className="rounded-xl border border-[#ded7ce]/80 bg-[#fbf8f3] p-3.5 dark:border-white/8 dark:bg-[#131417]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ede7de] text-[#8f5b36] dark:bg-white/10 dark:text-[#e4dad3]">
                            <Database size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-[#2c211c] dark:text-[#f8eee5]">
                                Embedded SQLite Database
                            </div>
                            <div className="text-[11px] font-mono text-[#7e695d] dark:text-[#9e9791] truncate">
                                kapivara.db • WAL (Write-Ahead Logging) Mode
                            </div>
                        </div>
                    </div>
                </div>

                <SettingRow
                    label="Crash Resilience"
                    description="WAL journaling ensures immediate ACID durability and zero corruption on sudden system shutdown."
                >
                    <span className="text-xs font-semibold text-[#2c211c] dark:text-[#ede8e3]">
                        Enabled
                    </span>
                </SettingRow>
            </SettingCard>

            {/* Session Logs and Memory */}
            <SettingCard
                title="Session Memory & Logs"
                description="Manage ephemeral execution logs and volatile caches."
            >
                <SettingRow
                    label="Session Execution Logs"
                    description={`Current in-memory request/response entries (${consoleEntries.length} items).`}
                >
                    <button
                        type="button"
                        onClick={handleClearConsole}
                        disabled={consoleEntries.length === 0}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#ded7ce] bg-white px-3 py-1.5 text-xs font-medium text-[#7e695d] transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-40 disabled:pointer-events-none dark:border-white/10 dark:bg-[#121316] dark:text-[#9e9791] dark:hover:border-red-800/60 dark:hover:bg-red-950/30 dark:hover:text-red-400 cursor-pointer"
                    >
                        <Trash2 size={13} />
                        Clear Session
                    </button>
                </SettingRow>
            </SettingCard>

            {/* Maintenance & Reset */}
            <SettingCard
                title="Maintenance"
                description="Revert settings to fresh installation state."
            >
                <SettingRow
                    label="Restore Default Preferences"
                    description="Resets general configuration (theme, font size, timeouts) to default values without affecting projects or requests."
                >
                    <button
                        type="button"
                        onClick={handleResetSettings}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#ded7ce] bg-white px-3 py-1.5 text-xs font-medium text-[#7e695d] transition-colors hover:bg-[#ede7de] hover:text-[#2c211c] dark:border-white/10 dark:bg-[#121316] dark:text-[#9e9791] dark:hover:bg-white/10 dark:hover:text-[#f8eee5] cursor-pointer"
                    >
                        <RotateCcw size={13} />
                        Reset Defaults
                    </button>
                </SettingRow>
            </SettingCard>
        </div>
    );
};
