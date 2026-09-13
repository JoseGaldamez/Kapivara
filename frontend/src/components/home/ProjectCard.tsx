import KapivaraMark from "@/assets/images/logo.png";
import { Project } from "@/types";
import { ArrowUpRight, Ellipsis, FolderOpen } from "lucide-react";
import { useState } from "react";
import { OptionsCard } from "./OptionsCard";


interface ProjectCardProps {
    project: Project,
    deleteThisProject: (project: Project) => void,
    onClick: (project: Project) => void
}

export const ProjectCard = ({ project, deleteThisProject, onClick }: ProjectCardProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const lastOpened = project.lastOpenAt
        ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(project.lastOpenAt))
        : "Not opened yet";

    return (
        <article
            onClick={() => onClick(project)}
            className="group relative flex min-h-[184px] w-full cursor-pointer flex-col overflow-visible rounded-[10px] border border-[#ddd6cf] bg-[#fffdf9] p-5 shadow-[0_5px_18px_rgba(62,47,37,0.045)] transition-[box-shadow,border-color] hover:border-[#a99b90] hover:shadow-[0_8px_22px_rgba(62,47,37,0.08)] focus-within:border-[#6e96b8] dark:border-white/9 dark:bg-[#1a1b20] dark:shadow-none dark:hover:border-white/18"
        >
            <div className="flex items-start justify-between">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-[#efe8e1] text-[#875937] dark:bg-[#d99557]/10 dark:text-[#d99a67]">
                    <FolderOpen size={21} strokeWidth={1.8} />
                    <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#fffdf9] bg-emerald-500 dark:border-[#1a1b20]" />
                </div>
                <div className="relative z-20">
                        <button
                            type="button"
                            aria-label={`Open options for ${project.name}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(!isOpen);
                            }}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[11px] text-[#8b756a] transition-colors hover:bg-[#f1e6dc] hover:text-[#362118] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E61B1] dark:text-[#8f8b87] dark:hover:bg-white/7 dark:hover:text-white"
                        >
                            <Ellipsis size={19} />
                        </button>

                        {isOpen ? (
                            <OptionsCard deleteThisProject={deleteThisProject} project={project} setIsOpen={setIsOpen} />
                        ) : null}
                </div>
            </div>

            <div className="mt-5 min-w-0 pr-10">
                <h2 className="truncate text-[16px] font-semibold tracking-[-0.015em] text-[#342b26] dark:text-[#f7eee8]">{project.name}</h2>
                <p className="mt-1.5 line-clamp-2 min-h-10 text-[13px] leading-5 text-[#826d62] dark:text-[#9e9995]">
                    {project.description || "A quiet space for requests, environments, and saved responses."}
                </p>
            </div>

            <div className="mt-auto flex items-end justify-between pt-5">
                <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#95867d] dark:text-[#74716e]">Last opened</p>
                    <p className="mt-1 text-[11px] font-semibold text-[#70594d] dark:text-[#aaa39e]">{lastOpened}</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#edf5fd] text-[#0E61B1] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:bg-blue-500/10 dark:text-blue-400">
                    <ArrowUpRight size={17} />
                </span>
            </div>

            <img src={KapivaraMark} alt="" className="pointer-events-none absolute bottom-9 right-14 w-16 opacity-[0.035] dark:opacity-[0.025]" />
        </article>
    );
};
