import { useEffect, useState } from "react"
import { NewProjectCard } from "./NewProjectCard"
import { ProjectCard } from "./ProjectCard"
import { ProjectMetadata } from "@/models/projectMetadata"
import { getAllProjects, createProject, deleteProject } from "@/services/projects.service" // Assuming these services exist

export const ContainerListProjects = () => {
    const [projects, setProjects] = useState<ProjectMetadata[]>([])

    const loadProjects = async () => {
        try {
            const loadedProjects = await getAllProjects();
            setProjects(loadedProjects);
        } catch (e) {
            console.error("Error loading projects:", e);
        }
    }

    useEffect(() => {
        loadProjects();
    }, []);

    const handleCreateTestProject = async () => {
        try {
            const newProject: ProjectMetadata = {
                uid: crypto.randomUUID(),
                name: `Test Project ${projects.length + 1} `,
                description: "A test project created from the UI.",
                createdAt: new Date(),
                iconColor: "#FF5733",
                lastOpenedAt: new Date(),
                version: "1.0.0",
            };

            await createProject(newProject);
            await loadProjects();
        } catch (e: any) {
            console.error("Error creating test project:", e);
        }
    };

    const deleteThisProject = async (project: ProjectMetadata) => {
        try {
            await deleteProject(project);
            await loadProjects();
        } catch (e) {
            console.error("Error deleting project:", e);
        }
    }

    return (
        <div className='m-4 p-4 bg-[#F9FAFC] rounded-3xl h-[calc(100vh-6rem)]'>
            <div className="pb-8">
                <h1 className="text-2xl font-bold text-gray-800">Your projects</h1>
                <p className="text-gray-500">Manage your projects</p>
            </div>
            <div className="flex flex-wrap gap-4 flex-1 h-[calc(100vh-13rem)] overflow-y-auto">
                <NewProjectCard onClick={handleCreateTestProject} />
                {projects.map((project) => (
                    <ProjectCard deleteThisProject={deleteThisProject} key={project.uid} project={project} />
                ))}
            </div>
        </div>
    )
}
