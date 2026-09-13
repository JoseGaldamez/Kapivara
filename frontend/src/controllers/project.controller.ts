import { useProjectStore } from '../stores/project.store';
import ProjectService from '../services/projects.service';
import { Project } from '../types';
import { environmentController } from './environment.controller';

class ProjectController {
    private service: ProjectService | null = null;
    private servicePromise: Promise<ProjectService> | null = null;

    private async getService() {
        if (this.service) return this.service;
        if (!this.servicePromise) {
            this.servicePromise = ProjectService.getInstance()
                .then(s => { this.service = s; return s; })
                .catch(e => { this.servicePromise = null; throw e; });
        }
        return this.servicePromise;
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

    public async createNewProject(name: string, description: string, iconColor: string, baseUrl?: string) {
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

            // Automatically create 'Local' environment with baseUrl
            await environmentController.createEnvironment('project', 'Local', newProject.uid, [
                {
                    id: crypto.randomUUID(),
                    key: 'baseUrl',
                    value: baseUrl ? baseUrl.trim() : '',
                    enabled: 1
                }
            ]);

            return newProject;
        } catch (error) {
            console.error('Failed to create project:', error);
            throw error;
        }
    }


    public async updateProject(projectId: string, updates: Partial<Project>) {
        try {
            const service = await this.getService();
            await service.updateProject({ uid: projectId, ...updates });
            useProjectStore.getState().updateProject(projectId, updates);
        } catch (error) {
            console.error('Failed to update project:', error);
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
        useProjectStore.getState().selectProject(project.uid);
    }

    public goHome() {
        useProjectStore.getState().selectProject(null);
    }
}

export const projectController = new ProjectController();
