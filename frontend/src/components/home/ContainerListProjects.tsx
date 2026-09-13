import { useState } from "react";
import { useProjectStore } from "@/stores/project.store";
import { Project } from "@/types";
import { projectController } from "@/controllers/project.controller";
import { NewProjectCard } from "./NewProjectCard";
import { ProjectCard } from "./ProjectCard";
import { DeleteProjectModal } from "../modals/DeleteProjectModal";
import HomeArtwork from "@/assets/images/logo-home.png";
import BrandMark from "@/assets/images/logo.png";
import {
    ArrowRight,
    Braces,
    Database,
    FolderOpen,
    Plus,
    SearchX,
    Send,
    ShieldCheck,
} from "lucide-react";

interface ContainerListProjectsProps {
    searchFilter?: string;
    onCreateProject: () => void;
}

const VALUE_ITEMS = [
    {
        icon: Database,
        title: "Local by default",
        copy: "Projects and responses stay in your local SQLite workspace.",
        color: "copper",
    },
    {
        icon: Braces,
        title: "Variables in context",
        copy: "Combine global and project environments without collisions.",
        color: "green",
    },
    {
        icon: Send,
        title: "A focused request flow",
        copy: "Compose, send, inspect, and save responses in one calm view.",
        color: "blue",
    },
] as const;

const ValueRail = () => (
    <section className="home-reveal home-reveal-delay-2 grid overflow-hidden rounded-[10px] border border-[#ddd6cf] bg-[#faf7f3] dark:border-white/8 dark:bg-white/[0.025] md:grid-cols-3">
        {VALUE_ITEMS.map(({ icon: Icon, title, copy, color }, index) => (
            <div
                key={title}
                className={`flex min-h-[126px] items-start gap-4 px-6 py-6 ${index > 0 ? "border-t border-[#e5d9cf] md:border-l md:border-t-0 dark:border-white/7" : ""}`}
            >
                <div className={`home-value-icon home-value-icon-${color} flex h-10 w-10 shrink-0 items-center justify-center rounded-lg`}>
                    <Icon size={21} strokeWidth={1.8} />
                </div>
                <div>
                    <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#382c26] dark:text-[#f4ebe5]">{title}</h3>
                    <p className="mt-1.5 max-w-[32ch] text-[13px] leading-5 text-[#806b60] dark:text-[#9d9894]">{copy}</p>
                </div>
            </div>
        ))}
    </section>
);

const WorkspacePreview = () => (
    <div className="home-reveal home-reveal-delay-3 mt-7">
        <section className="relative h-[225px] overflow-hidden rounded-[10px] border border-[#ddd6cf] bg-[#fffdf9] opacity-35 shadow-[0_10px_28px_rgba(62,47,37,0.06)] dark:border-white/8 dark:bg-[#191a1f]">
            <div className="flex h-9 items-center gap-2 border-b border-[#eadfd6] px-4 dark:border-white/7">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff7b70]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#f5c75d]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#63c987]" />
                <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold text-[#aa9386] dark:text-[#77736f]">
                    <ShieldCheck size={12} /> Project workspace
                </span>
            </div>

            <div className="grid h-[calc(100%-36px)] grid-cols-[190px_1fr_220px]">
                <div className="border-r border-[#eee4dc] p-4 dark:border-white/6">
                    <div className="mb-4 h-8 rounded-[9px] bg-[#eaf4ff] px-3 py-2 text-[10px] font-bold text-[#0E61B1] dark:bg-blue-500/10 dark:text-blue-400">All requests</div>
                    <div className="space-y-3 px-2">
                        <div className="h-2 w-24 rounded-full bg-[#eadfd7] dark:bg-white/7" />
                        <div className="h-2 w-20 rounded-full bg-[#eadfd7] dark:bg-white/7" />
                        <div className="h-2 w-28 rounded-full bg-[#eadfd7] dark:bg-white/7" />
                    </div>
                </div>

                <div className="p-5">
                    <div className="mb-5 flex gap-2">
                        <div className="flex h-9 w-20 items-center rounded-[9px] border border-[#e6dacf] px-3 text-[10px] font-bold text-emerald-600 dark:border-white/8">GET</div>
                        <div className="h-9 flex-1 rounded-[9px] border border-[#e6dacf] bg-[#fdf9f5] dark:border-white/8 dark:bg-white/[0.025]" />
                        <div className="flex h-9 w-24 items-center justify-center rounded-[9px] bg-[#0E61B1] text-[10px] font-bold text-white">Send</div>
                    </div>
                    <div className="flex gap-6 border-b border-[#e9ded5] pb-2 text-[9px] font-bold text-[#a18d82] dark:border-white/7 dark:text-[#716e6b]">
                        <span className="text-[#0E61B1]">Params</span><span>Headers</span><span>Auth</span><span>Body</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        {["w-16", "w-24", "w-12", "w-20", "w-14", "w-24"].map((width, index) => (
                            <div key={index} className={`h-2 ${width} rounded-full bg-[#eee6df] dark:bg-white/6`} />
                        ))}
                    </div>
                </div>

                <div className="border-l border-[#eee4dc] p-5 dark:border-white/6">
                    <div className="h-2 w-16 rounded-full bg-[#e7ddd5] dark:bg-white/7" />
                    <div className="mt-5 h-2 w-32 rounded-full bg-[#eee6df] dark:bg-white/6" />
                    <div className="mt-3 h-2 w-24 rounded-full bg-[#eee6df] dark:bg-white/6" />
                    <img src={BrandMark} alt="" className="absolute bottom-[-28px] right-5 w-28 opacity-[0.08] dark:opacity-[0.035]" />
                </div>
            </div>
        </section>
    </div>
);

export const ContainerListProjects = ({ searchFilter = "", onCreateProject }: ContainerListProjectsProps) => {
    const projects = useProjectStore((state) => state.projects);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    const normalizedFilter = searchFilter.trim().toLowerCase();
    const filteredProjects = normalizedFilter
        ? projects.filter((project) => project.name.toLowerCase().includes(normalizedFilter))
        : projects;

    const handleDeleteProject = (project: Project) => {
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!projectToDelete) return;
        await projectController.deleteProject(projectToDelete.uid);
        setIsDeleteModalOpen(false);
        setProjectToDelete(null);
    };

    const overlays = (
        <>
            <DeleteProjectModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                projectName={projectToDelete?.name || ""}
            />
        </>
    );

    if (projects.length === 0) {
        return (
            <main className="flex h-full flex-col overflow-y-auto overscroll-contain">
                <div className="mx-auto my-auto w-full max-w-[1240px] px-6 py-8 lg:px-10 lg:py-10">
                    <section className="home-reveal grid min-h-[315px] items-center gap-8 md:grid-cols-[0.92fr_1.08fr] md:gap-10 lg:gap-14">
                        <div className="relative flex min-h-[280px] items-center justify-center">
                            <div className="home-art-halo absolute h-[230px] w-[230px] rounded-full" />
                            <img
                                src={HomeArtwork}
                                alt="Kapivara resting calmly"
                                className="home-mascot relative z-10 w-[240px] max-w-[70vw] drop-shadow-[0_14px_14px_rgba(85,45,22,0.08)] lg:w-[270px]"
                            />
                        </div>

                        <div className="max-w-[610px] pb-3">
                            <h1 className="max-w-[15ch] text-balance text-[clamp(2.35rem,4vw,3.65rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-[#2c211c] dark:text-[#f5efeb]">
                                Your API work starts here.
                            </h1>
                            <p className="mt-5 max-w-[56ch] text-[16px] leading-7 text-[#715b50] dark:text-[#aaa39e]">
                                Create an isolated workspace for requests, environments, variables, and the responses worth keeping.
                            </p>
                            <div className="mt-7 flex flex-wrap items-center gap-4">
                                <button
                                    type="button"
                                    onClick={onCreateProject}
                                    className="group flex h-11 cursor-pointer items-center gap-3 rounded-lg bg-[#245f92] px-5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(36,95,146,0.18)] transition-colors hover:bg-[#1d527f] active:bg-[#19486f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#28679f]"
                                >
                                    <Plus size={18} /> Create your first project
                                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                                </button>
                                <span className="flex items-center gap-2 text-xs font-semibold text-[#8b7569] dark:text-[#8f8a86]">
                                    <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
                                    Stored locally on your device
                                </span>
                            </div>
                        </div>
                    </section>

                    <ValueRail />
                    <WorkspacePreview />
                </div>
                {overlays}
            </main>
        );
    }

    return (
        <main className="h-full overflow-y-auto overscroll-contain">
            <div className="mx-auto w-full max-w-[1240px] px-6 pb-16 pt-7 lg:px-10">
                <section className="home-reveal relative grid min-h-[190px] overflow-hidden rounded-[10px] border border-[#d8d1ca] bg-[#34302d] px-7 py-7 text-[#f7f3ef] dark:border-white/8 dark:bg-[#202126] sm:px-9 lg:grid-cols-[1fr_230px] lg:items-center lg:px-10">
                    <div className="relative z-10 max-w-[650px]">
                        <h1 className="text-balance text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-[1.03] tracking-[-0.035em]">Back to your workspaces.</h1>
                        <p className="mt-4 max-w-[54ch] text-sm leading-6 text-[#d9c8bb] dark:text-[#b6b0ab]">Pick up an API project where you left it, or give the next idea a clean place to grow.</p>
                        <button
                            type="button"
                            onClick={onCreateProject}
                            className="mt-6 flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-[#e2a36d] px-4 text-sm font-semibold text-[#2d211b] transition-colors hover:bg-[#ebb17f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            <Plus size={17} /> New project
                        </button>
                    </div>
                    <img src={HomeArtwork} alt="" className="pointer-events-none absolute -bottom-14 right-8 w-48 opacity-75 lg:right-10" />
                </section>

                <section className="home-reveal home-reveal-delay-2 mt-9">
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-[-0.025em] text-[#352a24] dark:text-[#f8eee7]">Your projects</h2>
                            <p className="mt-1 text-sm text-[#887267] dark:text-[#9a9591]">
                                {normalizedFilter
                                    ? `${filteredProjects.length} ${filteredProjects.length === 1 ? "match" : "matches"} for “${searchFilter.trim()}”`
                                    : `${projects.length} ${projects.length === 1 ? "workspace" : "workspaces"}, ready when you are.`}
                            </p>
                        </div>
                        <span className="hidden items-center gap-2 text-xs font-bold text-[#8b756a] dark:text-[#8c8884] sm:flex">
                            <FolderOpen size={15} /> Local library
                        </span>
                    </div>

                    {filteredProjects.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            <NewProjectCard onClick={onCreateProject} />
                            {filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.uid}
                                    deleteThisProject={handleDeleteProject}
                                    project={project}
                                    onClick={() => projectController.openProject(project)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[10px] border border-dashed border-[#cbbfb5] bg-[#faf7f3] px-6 text-center dark:border-white/12 dark:bg-white/[0.025]">
                            <SearchX size={28} className="text-[#a88e7e] dark:text-[#77736f]" />
                            <h3 className="mt-4 text-base font-extrabold text-[#3b251c] dark:text-[#eee6e0]">No project matches that search</h3>
                            <p className="mt-1.5 text-sm text-[#8a756a] dark:text-[#96918d]">Try another name or clear the search field above.</p>
                        </div>
                    )}
                </section>
            </div>
            {overlays}
        </main>
    );
};
