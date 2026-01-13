import KapivaraCardIcon from "@/assets/kapivara-card.png"
import { Project } from "@/types"
import { EllipsisVertical, FolderOpen } from "lucide-react"
import { useState } from "react"
import { OptionsCard } from "./OptionsCard"


interface ProjectCardProps {
    project: Project,
    deleteThisProject: (project: Project) => void,
    onClick: (project: Project) => void
}

export const ProjectCard = ({ project, deleteThisProject, onClick }: ProjectCardProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div onClick={() => onClick(project)} className="flex flex-col justify-between w-80 min-w-80 h-64 min-h-64 bg-[#0E61B1]/5 rounded-3xl p-4 cursor-pointer hover:bg-[#0E61B1]/10 transition-colors border border-[#0E61B1]/10 relative">
            <div className="flex flex-col justify-between">
                <div className="flex items-center justify-between">
                    <div className="bg-[#0E61B1]/5 rounded-full p-2 w-16 h-16 flex items-center justify-center">
                        <FolderOpen className={`w-10 h-10 text-[#0E61B1]`} />
                    </div>

                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(!isOpen);
                            }}
                            className="bg-[#0E61B1]/5 rounded-full p-2 cursor-pointer hover:bg-[#0E61B1]/10 transition-colors"
                        >
                            <EllipsisVertical className="w-5 h-5 text-[#0E61B1]" />
                        </button>

                        {isOpen && (
                            <OptionsCard deleteThisProject={deleteThisProject} project={project} setIsOpen={setIsOpen} />
                        )}
                    </div>
                </div>
                <h2 className="text-blue-950 text-lg font-bold line-clamp-2 mt-4">{project.name}</h2>
                <p className="text-gray-500 line-clamp-2 mt-2 text-sm">{project.description}</p>

            </div>

            <img src={KapivaraCardIcon} alt="Kapivara Card" className="w-32 opacity-20 absolute bottom-1 right-1 pointer-events-none" />
        </div>
    )
}
