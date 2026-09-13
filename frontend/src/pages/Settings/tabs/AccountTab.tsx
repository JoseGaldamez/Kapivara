import { useState, useEffect } from "react";
import { User, ShieldCheck, Database, HardDrive, Laptop } from "lucide-react";
import { SettingCard } from "../components/SettingCard";
import { SettingRow } from "../components/SettingRow";
import { toast } from "react-toastify";

export const AccountTab = () => {
    const [userName, setUserName] = useState("Developer");
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("kapivara_local_user");
        if (saved) setUserName(saved);
    }, []);

    const handleSaveName = () => {
        const trimmed = userName.trim() || "Developer";
        localStorage.setItem("kapivara_local_user", trimmed);
        setUserName(trimmed);
        setIsSaved(true);
        toast.success("Profile name updated");
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-base font-semibold text-[#2c211c] dark:text-[#f8eee5]">
                    Account & Workspace
                </h2>
                <p className="text-xs text-[#7e695d] dark:text-[#9e9791] mt-0.5">
                    Local profile and storage identity for this installation.
                </p>
            </div>

            {/* Profile Overview Card */}
            <SettingCard
                title="Local Identity"
                description="Your workspace operates entirely on this machine without required cloud logins."
                badge={
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Local-First Active
                    </span>
                }
            >
                <div className="flex items-center gap-4 py-2">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0e7dc] text-[#8f5b36] dark:bg-white/10 dark:text-[#e4dad3] shadow-xs">
                        <User size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                                placeholder="Display Name"
                                className="h-8 max-w-[240px] rounded-lg border border-[#ded7ce] bg-white px-2.5 text-xs font-semibold text-[#2c211c] focus:border-[#245f92] focus:outline-none dark:border-white/10 dark:bg-[#121316] dark:text-[#f8eee5]"
                            />
                            <button
                                type="button"
                                onClick={handleSaveName}
                                className="h-8 rounded-lg bg-[#245f92] px-3 text-xs font-medium text-white transition-colors hover:bg-[#1d4e78] cursor-pointer"
                            >
                                {isSaved ? "Saved" : "Save"}
                            </button>
                        </div>
                        <p className="mt-1 text-[11px] text-[#7e695d] dark:text-[#9e9791]">
                            Used for local identification and team export metadata.
                        </p>
                    </div>
                </div>
            </SettingCard>

            {/* Privacy & Storage Details */}
            <SettingCard
                title="Privacy & Architecture"
                description="Guarantees regarding your sensitive keys, tokens, and data."
            >
                <SettingRow
                    icon={<ShieldCheck size={16} />}
                    label="Zero Cloud Transmission"
                    description="Your request payloads, auth headers, and environment secrets are never sent to third-party servers."
                >
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Enforced
                    </span>
                </SettingRow>

                <SettingRow
                    icon={<Database size={16} />}
                    label="Local Storage Engine"
                    description="Persistent storage backed by an embedded SQLite 3 database."
                >
                    <span className="text-xs font-mono font-medium text-[#2c211c] dark:text-[#ede8e3]">
                        SQLite 3 (WAL)
                    </span>
                </SettingRow>

                <SettingRow
                    icon={<HardDrive size={16} />}
                    label="Storage Location"
                    description="Collections, requests and settings are kept in the user application data directory."
                >
                    <span className="text-xs font-mono text-[#7e695d] dark:text-[#9e9791]">
                        Local AppData
                    </span>
                </SettingRow>

                <SettingRow
                    icon={<Laptop size={16} />}
                    label="Environment Isolation"
                    description="Each project acts as a self-contained sandbox with its own variables."
                >
                    <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                        Isolated
                    </span>
                </SettingRow>
            </SettingCard>
        </div>
    );
};
