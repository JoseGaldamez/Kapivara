import { useProjectStore } from '../stores/project.store';
import ProjectService from '../services/projects.service';
import { Project } from '../types';

class ProjectController {
    private service: ProjectService | null = null;

    private async getService() {
        if (!this.service) {
            this.service = await ProjectService.getInstance();
        }
        return this.service;
    }

    public async loadProjects() {
        try {
            const service = await this.getService();
            const projects = await service.getProjects();
            useProjectStore.getState().setProjects(projects);
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    }

    public async createNewProject(name: string, description: string, iconColor: string) {
        try {
            const service = await this.getService();

            const newProject: Project = {
                uid: crypto.randomUUID(),
                name,
                description,
                iconColor,
                lastOpenAt: new Date().toISOString()
            };

            await service.createProject(newProject);
            useProjectStore.getState().addProject(newProject);
            return newProject;
        } catch (error) {
            console.error('Failed to create project:', error);
            throw error;
        }
    }


    public async deleteProject(projectId: string) {
        try {
            const service = await this.getService();
            await service.deleteProject(projectId);
            useProjectStore.getState().removeProject(projectId);
            this.loadProjects();
        } catch (error) {
            console.error('Failed to delete project:', error);
            throw error;
        }
    }

    public openProject(project: Project) {
        useProjectStore.getState().openProjectTab(project);
    }

    public selectTab(tabId: string) {
        useProjectStore.getState().setActiveTab(tabId);
    }

    public closeTab(tabId: string) {
        useProjectStore.getState().closeTab(tabId);
    }
}

export const projectController = new ProjectController();
