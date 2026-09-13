import { Braces, History, Send, Settings } from "lucide-react";

export type AppSection = "requests" | "environments" | "history" | "settings";

interface AppSidebarProps {
    activeSection: AppSection;
    hasProject: boolean;
    onNavigate: (section: AppSection) => void;
}

interface RailButtonProps {
    label: string;
    icon: typeof Send;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
}

const RailButton = ({ label, icon: Icon, active = false, disabled = false, onClick }: RailButtonProps) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={disabled ? `${label} — select a project first` : label}
        aria-current={active ? "page" : undefined}
        className={`group flex min-h-[60px] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg px-1.5 text-[10px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#28679f] disabled:cursor-not-allowed disabled:opacity-35 ${active ? "bg-[#e9eef2] text-[#1f5f96] dark:bg-blue-500/10 dark:text-blue-400" : "text-[#625952] hover:bg-[#eeeae6] hover:text-[#2f2823] dark:text-[#aaa39e] dark:hover:bg-white/6 dark:hover:text-white"}`}
    >
        <Icon size={22} strokeWidth={1.7} className="transition-transform group-active:scale-95" />
        <span className="max-w-full truncate">{label}</span>
    </button>
);

export const AppSidebar = ({ activeSection, hasProject, onNavigate }: AppSidebarProps) => (
    <aside className="relative z-30 flex w-[80px] shrink-0 flex-col border-r border-[#ddd6cf] bg-[#f8f5f1] px-2 py-3 dark:border-white/8 dark:bg-[#17181d]">
        <nav aria-label="Primary navigation" className="flex flex-col gap-1.5">
            <RailButton label="Requests" icon={Send} active={activeSection === "requests"} onClick={() => onNavigate("requests")} />
            <RailButton label="Variables" icon={Braces} disabled={!hasProject} active={activeSection === "environments"} onClick={() => onNavigate("environments")} />
            <RailButton label="History" icon={History} disabled={!hasProject} active={activeSection === "history"} onClick={() => onNavigate("history")} />
            <RailButton label="Settings" icon={Settings} disabled={!hasProject} active={activeSection === "settings"} onClick={() => onNavigate("settings")} />
        </nav>

        <div className="mt-auto border-t border-[#e1dad4] pt-3 text-center dark:border-white/7">
            <span className="inline-flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#8d8178] dark:text-[#77736f]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Local first
            </span>
        </div>
    </aside>
);
