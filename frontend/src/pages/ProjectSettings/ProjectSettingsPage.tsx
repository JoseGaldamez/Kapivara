import { useState, useEffect } from "react";
import { Project } from "@/types";
import { projectController } from "@/controllers/project.controller";
import RequestService from "@/services/request.service";
import EnvironmentService from "@/services/environment.service";
import { DeleteProjectModal } from "@/components/modals/DeleteProjectModal";
import { ProjectPageHeader } from "@/components/common/ProjectPageHeader";
import {
    Check,
    Copy,
    Database,
    FolderTree,
    Save,
    Send,
    ShieldAlert,
    Sliders,
} from "lucide-react";

interface ProjectSettingsPageProps {
    project: Project;
    onNavigateToRequests: () => void;
    onNavigateToEnvironments?: () => void;
}

const COLOR_PALETTE = [
    { label: "Kapivara Blue", value: "#245f92" },
    { label: "Copper Warm", value: "#b8753a" },
    { label: "Forest Emerald", value: "#15803d" },
    { label: "Royal Purple", value: "#9333ea" },
    { label: "Amber Sun", value: "#d97706" },
    { label: "Slate Neutral", value: "#475569" },
    { label: "Ruby Crimson", value: "#b91c1c" },
];

export const ProjectSettingsPage = ({
    project,
    onNavigateToRequests,
    onNavigateToEnvironments,
}: ProjectSettingsPageProps) => {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description || "");
    const [iconColor, setIconColor] = useState(project.iconColor || "#245f92");
    const [isSaving, setIsSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [copiedUid, setCopiedUid] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Project statistics
    const [stats, setStats] = useState({
        requestsCount: 0,
        collectionsCount: 0,
        environmentsCount: 0,
        loading: true,
    });

    useEffect(() => {
        setName(project.name);
        setDescription(project.description || "");
        setIconColor(project.iconColor || "#245f92");
    }, [project.uid, project.name, project.description, project.iconColor]);

    useEffect(() => {
        let isMounted = true;
        const loadStats = async () => {
            try {
                const reqService = await RequestService.getInstance();
                const envService = await EnvironmentService.getInstance();

                const [requests, collections, environments] = await Promise.all([
                    reqService.getRequests(project.uid),
                    reqService.getCollections(project.uid),
                    envService.getProjectEnvironments(project.uid),
                ]);

                if (isMounted) {
                    setStats({
                        requestsCount: requests.length,
                        collectionsCount: collections.length,
                        environmentsCount: environments.length,
                        loading: false,
                    });
                }
            } catch (error) {
                console.error("Failed to load project stats:", error);
                if (isMounted) {
                    setStats((prev) => ({ ...prev, loading: false }));
                }
            }
        };

        void loadStats();
        return () => {
            isMounted = false;
        };
    }, [project.uid]);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName || isSaving) return;

        setIsSaving(true);
        setSavedSuccess(false);
        try {
            await projectController.updateProject(project.uid, {
                name: trimmedName,
                description: description.trim(),
                iconColor,
            });
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to update project settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopyUid = async () => {
        try {
            await navigator.clipboard.writeText(project.uid);
            setCopiedUid(true);
            setTimeout(() => setCopiedUid(false), 2000);
        } catch (err) {
            console.error("Failed to copy UID:", err);
        }
    };

    const handleDeleteConfirm = async () => {
        await projectController.deleteProject(project.uid);
        setIsDeleteModalOpen(false);
    };

    return (
        <main className="h-full overflow-y-auto overscroll-contain bg-[#f4eadf] text-[#2c211c] transition-colors dark:bg-[#101115] dark:text-[#f8eee5]">
            <div className="mx-auto w-full max-w-[1120px] px-6 py-7 lg:px-10 lg:py-8">
                <ProjectPageHeader
                    title="Project Settings"
                    description="Configuration and workspace preferences for"
                    projectName={project.name}
                    icon={Sliders}
                    iconColor={iconColor}
                    onNavigateToRequests={onNavigateToRequests}
                    actions={
                        savedSuccess ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <Check size={14} /> Changes saved
                            </span>
                        ) : null
                    }
                />

                <div className="space-y-6">
                    {/* General Settings Card */}
                    <form
                        onSubmit={handleSave}
                        className="rounded-xl border border-[#ded7ce] bg-[#fffdf9] p-6 shadow-[0_6px_20px_rgba(62,47,37,0.04)] dark:border-white/8 dark:bg-[#18191e]"
                    >
                        <h2 className="text-base font-semibold tracking-[-0.02em] text-[#2c211c] dark:text-[#f8eee5]">
                            General Information
                        </h2>
                        <p className="mt-1 text-xs text-[#7e695d] dark:text-[#9e9791]">
                            Customize your project identity and appearance.
                        </p>

                        <div className="mt-6 space-y-5">
                            {/* Project Name */}
                            <div>
                                <label
                                    htmlFor="project-name-input"
                                    className="block text-xs font-semibold text-[#503d32] dark:text-[#cfc8c2]"
                                >
                                    Project Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="project-name-input"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter project name"
                                    required
                                    className="mt-1.5 h-10 w-full rounded-lg border border-[#d8d0c7] bg-white px-3.5 text-sm text-[#2c211c] placeholder:text-[#a89c92] transition-colors focus:border-[#245f92] focus:outline-none dark:border-white/10 dark:bg-[#202127] dark:text-[#f8eee5] dark:placeholder:text-[#6a6661] dark:focus:border-[#3882c5]"
                                />
                            </div>

                            {/* Project Description */}
                            <div>
                                <label
                                    htmlFor="project-desc-input"
                                    className="block text-xs font-semibold text-[#503d32] dark:text-[#cfc8c2]"
                                >
                                    Description (optional)
                                </label>
                                <textarea
                                    id="project-desc-input"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Add a brief description for this workspace"
                                    className="mt-1.5 w-full rounded-lg border border-[#d8d0c7] bg-white p-3 text-sm text-[#2c211c] placeholder:text-[#a89c92] transition-colors focus:border-[#245f92] focus:outline-none dark:border-white/10 dark:bg-[#202127] dark:text-[#f8eee5] dark:placeholder:text-[#6a6661] dark:focus:border-[#3882c5]"
                                />
                            </div>

                            {/* Project Color Palette */}
                            <div>
                                <label className="block text-xs font-semibold text-[#503d32] dark:text-[#cfc8c2]">
                                    Accent Color
                                </label>
                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                    {COLOR_PALETTE.map((c) => {
                                        const isSelected = iconColor === c.value;
                                        return (
                                            <button
                                                key={c.value}
                                                type="button"
                                                onClick={() => setIconColor(c.value)}
                                                title={c.label}
                                                className={`group relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-transform hover:scale-105 ${
                                                    isSelected
                                                        ? "ring-2 ring-offset-2 ring-[#245f92] dark:ring-offset-[#18191e]"
                                                        : ""
                                                }`}
                                                style={{ backgroundColor: c.value }}
                                            >
                                                {isSelected && <Check size={16} className="text-white drop-shadow-xs" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-7 flex items-center justify-end border-t border-[#eee6df] pt-4 dark:border-white/7">
                            <button
                                type="submit"
                                disabled={isSaving || !name.trim()}
                                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-[#245f92] px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(36,95,146,0.18)] transition-colors hover:bg-[#1d527f] active:bg-[#19486f] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Save size={16} />
                                {isSaving ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </form>

                    {/* Overview & Statistics Card */}
                    <div className="rounded-xl border border-[#ded7ce] bg-[#fffdf9] p-6 shadow-[0_6px_20px_rgba(62,47,37,0.04)] dark:border-white/8 dark:bg-[#18191e]">
                        <h2 className="text-base font-semibold tracking-[-0.02em] text-[#2c211c] dark:text-[#f8eee5]">
                            Workspace Overview
                        </h2>
                        <p className="mt-1 text-xs text-[#7e695d] dark:text-[#9e9791]">
                            Resource metrics and metadata for this local workspace.
                        </p>

                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="flex items-center gap-3.5 rounded-lg border border-[#eee6df] bg-[#faf6f1] p-3.5 dark:border-white/6 dark:bg-[#1e2026]">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8eef4] text-[#245f92] dark:bg-blue-500/10 dark:text-blue-400">
                                    <Send size={18} />
                                </span>
                                <div>
                                    <div className="text-lg font-semibold text-[#2c211c] dark:text-[#f8eee5]">
                                        {stats.loading ? "—" : stats.requestsCount}
                                    </div>
                                    <div className="text-xs text-[#7e695d] dark:text-[#9e9791]">Requests</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5 rounded-lg border border-[#eee6df] bg-[#faf6f1] p-3.5 dark:border-white/6 dark:bg-[#1e2026]">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1e8df] text-[#8f5b36] dark:bg-amber-500/10 dark:text-amber-400">
                                    <FolderTree size={18} />
                                </span>
                                <div>
                                    <div className="text-lg font-semibold text-[#2c211c] dark:text-[#f8eee5]">
                                        {stats.loading ? "—" : stats.collectionsCount}
                                    </div>
                                    <div className="text-xs text-[#7e695d] dark:text-[#9e9791]">Collections</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5 rounded-lg border border-[#eee6df] bg-[#faf6f1] p-3.5 dark:border-white/6 dark:bg-[#1e2026]">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8efea] text-[#367557] dark:bg-emerald-500/10 dark:text-emerald-400">
                                    <Database size={18} />
                                </span>
                                <div>
                                    <div className="text-lg font-semibold text-[#2c211c] dark:text-[#f8eee5]">
                                        {stats.loading ? "—" : stats.environmentsCount}
                                    </div>
                                    <div className="text-xs text-[#7e695d] dark:text-[#9e9791]">Environments</div>
                                </div>
                            </div>
                        </div>

                        {/* Metadata Details */}
                        <div className="mt-6 border-t border-[#eee6df] pt-4 text-xs dark:border-white/7">
                            <div className="flex flex-wrap items-center justify-between gap-3 py-2">
                                <span className="text-[#7e695d] dark:text-[#9e9791]">Project Identifier (UID)</span>
                                <div className="flex items-center gap-2">
                                    <code className="rounded bg-[#f0e8e0] px-2 py-0.5 font-mono text-[11px] text-[#4d3a30] dark:bg-white/8 dark:text-[#d9d2cb]">
                                        {project.uid}
                                    </code>
                                    <button
                                        type="button"
                                        onClick={handleCopyUid}
                                        title="Copy UID"
                                        className="cursor-pointer rounded p-1 text-[#7e695d] hover:bg-[#efe6dd] hover:text-[#2c211c] dark:text-[#9e9791] dark:hover:bg-white/7 dark:hover:text-white"
                                    >
                                        {copiedUid ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>

                            {project.created_at && (
                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eee6df]/60 py-2 dark:border-white/5">
                                    <span className="text-[#7e695d] dark:text-[#9e9791]">Created At</span>
                                    <span className="font-mono text-[11px] text-[#4d3a30] dark:text-[#d9d2cb]">
                                        {new Date(project.created_at).toLocaleString()}
                                    </span>
                                </div>
                            )}

                            {project.lastOpenAt && (
                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eee6df]/60 py-2 dark:border-white/5">
                                    <span className="text-[#7e695d] dark:text-[#9e9791]">Last Opened</span>
                                    <span className="font-mono text-[11px] text-[#4d3a30] dark:text-[#d9d2cb]">
                                        {new Date(project.lastOpenAt).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Environments & Variables Quick Actions */}
                    {onNavigateToEnvironments && (
                        <div className="rounded-xl border border-[#ded7ce] bg-[#fffdf9] p-6 shadow-[0_6px_20px_rgba(62,47,37,0.04)] dark:border-white/8 dark:bg-[#18191e]">
                            <h2 className="text-base font-semibold tracking-[-0.02em] text-[#2c211c] dark:text-[#f8eee5]">
                                Environments & Variables
                            </h2>
                            <p className="mt-1 text-xs text-[#7e695d] dark:text-[#9e9791]">
                                Configure project-specific variables and inspect active resolved context.
                            </p>

                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={onNavigateToEnvironments}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#d8d0c7] bg-white px-4 py-2 text-xs font-semibold text-[#3d2a21] transition-colors hover:bg-[#f8f4ef] dark:border-white/10 dark:bg-[#202127] dark:text-[#f8eee5] dark:hover:bg-white/8"
                                >
                                    <Database size={15} /> Open Environments & Variables
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Danger Zone */}
                    <div className="rounded-xl border border-red-200/70 bg-[#fffbfa] p-6 shadow-[0_6px_20px_rgba(62,47,37,0.04)] dark:border-red-900/40 dark:bg-[#1c1414]">
                        <div className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                                <ShieldAlert size={18} />
                            </span>
                            <div className="flex-1">
                                <h2 className="text-base font-semibold tracking-[-0.02em] text-red-900 dark:text-red-300">
                                    Danger Zone
                                </h2>
                                <p className="mt-1 text-xs leading-relaxed text-red-800/80 dark:text-red-300/70">
                                    Deleting this project removes all associated requests, collections, and environments from your local SQLite database. This action cannot be reversed.
                                </p>

                                <div className="mt-5">
                                    <button
                                        type="button"
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-red-800"
                                    >
                                        Delete this project
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteProjectModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                projectName={project.name}
            />
        </main>
    );
};
