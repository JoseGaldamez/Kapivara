import { useState, useEffect } from "react"
import { useProjectStore } from "@/stores/project.store"
import { Project } from "@/types"

// Constrollers
import { projectController } from "@/controllers/project.controller"

// Components
import { NewProjectCard } from "./NewProjectCard"
import { ProjectCard } from "./ProjectCard"
import { CreateProjectModal, DeleteProjectModal } from "../modals"

interface ContainerListProjectsProps {
    searchFilter?: string;
}

export const ContainerListProjects = ({ searchFilter = "" }: ContainerListProjectsProps) => {
    const projects = useProjectStore((state) => state.projects);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    useEffect(() => {
        projectController.loadProjects();
    }, []);

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchFilter.toLowerCase())
    );

    const handleOpenProject = (project: Project) => {
        projectController.openProject(project);
    };

    const handleDeleteProject = async (project: Project) => {
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    }

    const handleConfirmDelete = async () => {
        if (projectToDelete) {
            await projectController.deleteProject(projectToDelete.uid);
            setIsDeleteModalOpen(false);
            setProjectToDelete(null);
        }
    }

    const getFilterSearch = () => {
        if (searchFilter && searchFilter.length > 0) {
            return <span className="text-gray-400 font-light text-sm">Filtered by: <span className="font-bold text-gray-600">{searchFilter}</span></span>;
        }
        return "Manage your projects";
    }

    const getBorderContentFiltered = () => {

        if (searchFilter && searchFilter.length > 0 && filteredProjects.length === 0) {
            return "border border-red-500";
        }

        if (searchFilter && searchFilter.length > 0 && filteredProjects.length > 0) {
            return "border border-green-500";
        }
        return "border border-transparent";
    }

    return (
        <div className={`${getBorderContentFiltered()} m-4 p-4 bg-[#F9FAFC] dark:bg-gray-900/80 rounded-3xl h-[calc(100vh-10rem)] transition-colors`}>
            <div className="pb-8">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Your projects</h1>
                <p className="text-gray-500 dark:text-gray-400">{getFilterSearch()}</p>
            </div>
            <div className="flex flex-wrap gap-4 flex-1 h-[calc(100vh-17rem)] overflow-y-auto">
                <NewProjectCard onClick={() => setIsModalOpen(true)} />
                {filteredProjects.map((project) => (
                    <div key={project.uid}>
                        <ProjectCard
                            deleteThisProject={handleDeleteProject}
                            project={project}
                            onClick={() => handleOpenProject(project)}
                        />
                    </div>
                ))}
            </div>
            <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <DeleteProjectModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                projectName={projectToDelete?.name || ''}
            />
        </div>
    )
}
