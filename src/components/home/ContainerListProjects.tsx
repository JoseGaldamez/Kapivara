import { useState } from "react"
import { NewProjectCard } from "./NewProjectCard"
import { ProjectCard } from "./ProjectCard"
import { ProjectMetadata } from "@/models/projectMetadata"

export const ContainerListProjects = () => {
    const [projects] = useState<ProjectMetadata[]>([
        {
            id: "1",
            name: "Testing API personal con nombre grande para comprobar si se muestra correctamente",
            description: "API para probar el proyecto de ecommerce",
            createdAt: new Date(),
            iconColor: "#0E61B1",
            lastOpenedAt: new Date(),
            version: "1.0.0",
        },
        {
            id: "2",
            name: "Ecommerce API",
            description: "API para probar el proyecto de ecommerce",
            createdAt: new Date(),
            iconColor: "#0E61B1",
            lastOpenedAt: new Date(),
            version: "1.0.0",
        },
    ])



    return (
        <div className='m-4 p-4 bg-[#F9FAFC] rounded-3xl h-[calc(100vh-6rem)]'>
            <div className="pb-8">
                <h1 className="text-3xl font-bold text-gray-800">Your projects</h1>
                <p className="text-gray-500">Manage your projects</p>
            </div>
            <div className="flex flex-wrap gap-4">
                <NewProjectCard />
                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    )
}
