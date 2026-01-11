import { useEffect } from "react"
import { NewProjectCard } from "./NewProjectCard"
import { ProjectCard } from "./ProjectCard"
import { useProjectStore } from "@/stores/project.store"
import { projectController } from "@/controllers/project.controller"
import { Project } from "@/types"
import { useState } from "react"
import { CreateProjectModal } from "./CreateProjectModal"
import { DeleteProjectModal } from "./DeleteProjectModal"

export const ContainerListProjects = () => {
    const projects = useProjectStore((state) => state.projects);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    useEffect(() => {
        projectController.loadProjects();
    }, []);


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
        }
    }

    return (
        <div className='m-4 p-4 bg-[#F9FAFC] rounded-3xl h-[calc(100vh-8rem)]'>
            <div className="pb-8">
                <h1 className="text-2xl font-bold text-gray-800">Your projects</h1>
                <p className="text-gray-500">Manage your projects</p>
            </div>
            <div className="flex flex-wrap gap-4 flex-1 h-[calc(100vh-15rem)] overflow-y-auto">
                <NewProjectCard onClick={() => setIsModalOpen(true)} />
                {projects.map((project) => (
                    <div key={project.uid} onClick={() => handleOpenProject(project)}>
                        <ProjectCard
                            deleteThisProject={handleDeleteProject}
                            project={project}
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
