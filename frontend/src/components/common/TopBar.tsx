import BrandMark from "@/assets/images/logo.png";
import { environmentController } from "@/controllers/environment.controller";
import { useEnvironmentStore } from "@/stores/environment.store";
import { useProjectStore } from "@/stores/project.store";
import {
    Check,
    ChevronDown,
    FolderKanban,
    Globe2,
    Plus,
    Search,
    Settings,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { WindowControls } from "./WindowControls";
import { useDismissibleLayer } from "@/hooks/useDismissibleLayer";

interface TopBarProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onOpenSettings: () => void;
    onOpenCreateProject: () => void;
    onProjectSelected: () => void;
}

type OpenMenu = "project" | "environment" | null;
const EMPTY_ENVIRONMENTS: never[] = [];

export const TopBar = ({
    searchTerm,
    onSearchChange,
    onOpenSettings,
    onOpenCreateProject,
    onProjectSelected,
}: TopBarProps) => {
    const projects = useProjectStore((state) => state.projects);
    const activeProjectId = useProjectStore((state) => state.activeProjectId);
    const selectProject = useProjectStore((state) => state.selectProject);
    const projectEnvironments = useEnvironmentStore((state) =>
        activeProjectId ? state.projectEnvironmentsByProject[activeProjectId] ?? EMPTY_ENVIRONMENTS : EMPTY_ENVIRONMENTS
    );
    const globalEnvironments = useEnvironmentStore((state) => state.globalEnvironments);
    const activeProjectEnvironmentId = useEnvironmentStore((state) =>
        activeProjectId ? state.activeProjectEnvironmentIdByProject[activeProjectId] ?? null : null
    );
    const activeGlobalEnvironmentId = useEnvironmentStore((state) => state.activeGlobalEnvironmentId);
    const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
    const [isSavingEnvironment, setIsSavingEnvironment] = useState(false);
    const headerRef = useDismissibleLayer<HTMLElement>({
        isOpen: openMenu !== null,
        onDismiss: () => setOpenMenu(null),
    });

    const activeProject = projects.find((project) => project.uid === activeProjectId) ?? null;
    const activeProjectEnvironment = projectEnvironments.find((environment) => environment.id === activeProjectEnvironmentId);
    const activeGlobalEnvironment = globalEnvironments.find((environment) => environment.id === activeGlobalEnvironmentId);

    const environmentLabel = useMemo(() => {
        if (activeProjectEnvironment) return activeProjectEnvironment.name;
        if (activeGlobalEnvironment) return activeGlobalEnvironment.name;
        return "No environment";
    }, [activeGlobalEnvironment, activeProjectEnvironment]);

    useEffect(() => {
        if (activeProjectId) void environmentController.bootstrap(activeProjectId);
    }, [activeProjectId]);

    const chooseProject = (projectId: string | null) => {
        selectProject(projectId);
        setOpenMenu(null);
        onProjectSelected();
    };

    const toggleProjectEnvironment = async (environmentId: string) => {
        if (!activeProjectId || isSavingEnvironment) return;
        setOpenMenu(null);
        setIsSavingEnvironment(true);
        try {
            await environmentController.setActiveEnvironment(
                "project",
                activeProjectEnvironmentId === environmentId ? null : environmentId,
                activeProjectId
            );
        } finally {
            setIsSavingEnvironment(false);
        }
    };

    const toggleGlobalEnvironment = async (environmentId: string) => {
        if (isSavingEnvironment) return;
        setOpenMenu(null);
        setIsSavingEnvironment(true);
        try {
            await environmentController.setActiveEnvironment(
                "global",
                activeGlobalEnvironmentId === environmentId ? null : environmentId
            );
        } finally {
            setIsSavingEnvironment(false);
        }
    };

    return (
        <header ref={headerRef} className="window-drag-region relative z-50 flex h-[58px] shrink-0 items-center border-b border-[#ddd6cf] bg-[#fbf8f4] pl-4 dark:border-white/8 dark:bg-[#17181d] lg:pl-5">
            <button
                type="button"
                onClick={() => chooseProject(null)}
                className="flex min-w-[166px] cursor-pointer items-center gap-3 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E61B1]"
                aria-label="Go to all projects"
            >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#ded4ca] bg-[#f2ece6] dark:border-white/8 dark:bg-white/5">
                    <img src={BrandMark} alt="" className="h-8 w-8 object-contain" />
                </span>
                <span className="leading-none">
                    <span className="block text-[17px] font-semibold tracking-[-0.02em] text-[#2c211c] dark:text-[#f3eeea]">Kapivara</span>
                    <span className="mt-1 hidden text-[9px] font-semibold tracking-[0.08em] text-[#92786a] dark:text-[#a7a09b] xl:block">API WORK, CALMER.</span>
                </span>
            </button>

            <div className="relative ml-3 w-[clamp(145px,17vw,205px)]">
                <button
                    type="button"
                    onClick={() => setOpenMenu(openMenu === "project" ? null : "project")}
                    aria-haspopup="menu"
                    aria-expanded={openMenu === "project"}
                    className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-[#d9d2cb] bg-white px-3 text-left transition-colors hover:border-[#b8aca2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#28679f] dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                >
                    <FolderKanban size={17} className="shrink-0 text-[#b66d35] dark:text-[#e3a06a]" />
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#493127] dark:text-[#eee5df]" title={activeProject?.name ?? "Select a project"}>
                        {activeProject?.name ?? "Select project"}
                    </span>
                    <ChevronDown size={15} className={`shrink-0 text-[#927d72] transition-transform ${openMenu === "project" ? "rotate-180" : ""}`} />
                </button>

                {openMenu === "project" && (
                    <div role="menu" className="absolute left-0 top-[calc(100%+8px)] z-[60] w-[260px] overflow-hidden rounded-[10px] border border-[#d9d2cb] bg-white p-1.5 shadow-[0_12px_30px_rgba(45,34,27,0.12)] dark:border-white/10 dark:bg-[#202126]">
                        <button type="button" role="menuitem" onClick={() => chooseProject(null)} className="flex w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm font-bold text-[#574036] hover:bg-[#f5e9df] dark:text-[#ded5cf] dark:hover:bg-white/7">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f3e6db] text-[#9b6844] dark:bg-white/7 dark:text-[#d8a276]"><FolderKanban size={15} /></span>
                            All projects
                            {!activeProject && <Check size={15} className="ml-auto text-[#0E61B1]" />}
                        </button>
                        {projects.length > 0 && <div className="my-1 border-t border-[#eee3da] dark:border-white/7" />}
                        <div className="max-h-60 overflow-y-auto">
                            {projects.map((project) => (
                                <button key={project.uid} type="button" role="menuitem" onClick={() => chooseProject(project.uid)} className="flex w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm font-semibold text-[#574036] hover:bg-[#f5e9df] dark:text-[#ded5cf] dark:hover:bg-white/7">
                                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: project.iconColor || "#0E61B1" }} />
                                    <span className="truncate">{project.name}</span>
                                    {activeProjectId === project.uid && <Check size={15} className="ml-auto shrink-0 text-[#0E61B1]" />}
                                </button>
                            ))}
                        </div>
                        <div className="my-1 border-t border-[#eee3da] dark:border-white/7" />
                        <button type="button" role="menuitem" onClick={() => { setOpenMenu(null); onOpenCreateProject(); }} className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-[#1f5f96] hover:bg-[#edf2f6] dark:text-blue-400 dark:hover:bg-blue-500/10">
                            <Plus size={16} /> Create new project
                        </button>
                    </div>
                )}
            </div>

            <div className="relative ml-2 w-[clamp(145px,16vw,195px)]">
                <button
                    type="button"
                    disabled={!activeProject}
                    onClick={() => setOpenMenu(openMenu === "environment" ? null : "environment")}
                    aria-haspopup="menu"
                    aria-expanded={openMenu === "environment"}
                    className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-[#d9d2cb] bg-white px-3 text-left transition-colors hover:border-[#b8aca2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#28679f] disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${activeProjectEnvironment || activeGlobalEnvironment ? "bg-blue-500" : "bg-[#c7b8ae]"}`} />
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-[#493127] dark:text-[#eee5df]" title={environmentLabel}>{environmentLabel}</span>
                        {activeProjectEnvironment && activeGlobalEnvironment && <span className="block truncate text-[9px] font-semibold text-[#9a8377] dark:text-[#918b87]">+ {activeGlobalEnvironment.name} global</span>}
                    </span>
                    <ChevronDown size={15} className={`shrink-0 text-[#927d72] transition-transform ${openMenu === "environment" ? "rotate-180" : ""}`} />
                </button>

                {openMenu === "environment" && activeProject && (
                    <div role="menu" className="absolute left-0 top-[calc(100%+8px)] z-[60] w-[285px] overflow-hidden rounded-[10px] border border-[#d9d2cb] bg-white p-2 shadow-[0_12px_30px_rgba(45,34,27,0.12)] dark:border-white/10 dark:bg-[#202126]">
                        <p className="px-2 pb-1 pt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9c867a] dark:text-[#827d79]">Project environments</p>
                        {projectEnvironments.length ? projectEnvironments.map((environment) => (
                            <button key={environment.id} type="button" role="menuitemcheckbox" aria-checked={activeProjectEnvironmentId === environment.id} disabled={isSavingEnvironment} onClick={() => void toggleProjectEnvironment(environment.id)} className="flex w-full cursor-pointer items-center gap-2 rounded-[9px] px-2.5 py-2 text-left text-sm font-semibold text-[#574036] hover:bg-[#f5e9df] disabled:opacity-50 dark:text-[#ded5cf] dark:hover:bg-white/7">
                                <FolderKanban size={14} className="text-[#b66d35]" /><span className="truncate">{environment.name}</span>{activeProjectEnvironmentId === environment.id && <Check size={15} className="ml-auto text-[#0E61B1]" />}
                            </button>
                        )) : <p className="px-2.5 py-2 text-xs text-[#9a867b] dark:text-[#827d79]">No project environments yet.</p>}
                        <div className="my-1.5 border-t border-[#eee3da] dark:border-white/7" />
                        <p className="px-2 pb-1 pt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9c867a] dark:text-[#827d79]">Global environment</p>
                        {globalEnvironments.length ? globalEnvironments.map((environment) => (
                            <button key={environment.id} type="button" role="menuitemcheckbox" aria-checked={activeGlobalEnvironmentId === environment.id} disabled={isSavingEnvironment} onClick={() => void toggleGlobalEnvironment(environment.id)} className="flex w-full cursor-pointer items-center gap-2 rounded-[9px] px-2.5 py-2 text-left text-sm font-semibold text-[#574036] hover:bg-[#f5e9df] disabled:opacity-50 dark:text-[#ded5cf] dark:hover:bg-white/7">
                                <Globe2 size={14} className="text-violet-500" /><span className="truncate">{environment.name}</span>{activeGlobalEnvironmentId === environment.id && <Check size={15} className="ml-auto text-violet-500" />}
                            </button>
                        )) : <p className="px-2.5 py-2 text-xs text-[#9a867b] dark:text-[#827d79]">No global environments yet.</p>}
                        <p className="px-2.5 pb-1 pt-2 text-[10px] leading-4 text-[#a18b7f] dark:text-[#77726e]">Project variables override global variables. Both can stay active.</p>
                    </div>
                )}
            </div>

            <div className="ml-auto flex h-full min-w-0 items-center gap-2 pl-3">
                <label className="group relative hidden w-[clamp(190px,25vw,365px)] md:block">
                    <span className="sr-only">Search projects</span>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8f796e] transition-colors group-focus-within:text-[#0E61B1] dark:text-[#96928e]" size={17} />
                    <input type="search" placeholder="Search projects..." className="h-9 w-full rounded-lg border border-[#d9d2cb] bg-white pl-11 pr-10 text-sm text-[#30251f] outline-none transition-[border-color,box-shadow] placeholder:text-[#91857c] focus:border-[#6e96b8] focus:shadow-[0_0_0_3px_rgba(40,103,159,0.09)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-[#77736f] dark:focus:border-blue-500/70" value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} />
                    {searchTerm && <button type="button" aria-label="Clear search" onClick={() => onSearchChange("")} className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-[#957f74] hover:bg-[#f0e4da] dark:hover:bg-white/10"><X size={15} /></button>}
                </label>
                <button type="button" onClick={onOpenSettings} aria-label="Open general settings" title="General settings" className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#554941] transition-colors hover:bg-[#eee9e4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#28679f] dark:text-[#d5cfca] dark:hover:bg-white/7">
                    <Settings size={21} strokeWidth={1.8} />
                </button>
                <WindowControls />
            </div>
        </header>
    );
};
