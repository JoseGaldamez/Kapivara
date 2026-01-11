import DBService from '../services/db.service';
import { useProjectStore } from '../stores/project.store';
import { Project } from '../types';

class ProjectController {
    private db: DBService | null = null;

    private async getDB() {
        if (!this.db) {
            this.db = await DBService.getInstance();
        }
        return this.db;
    }

    public async loadProjects() {
        try {
            const db = await this.getDB();
            const projects = await db.getProjects();
            useProjectStore.getState().setProjects(projects);
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    }

    public async createNewProject(name: string, description: string, iconColor: string) {
        try {
            const db = await this.getDB();

            const newProject: Project = {
                uid: crypto.randomUUID(),
                name,
                description,
                iconColor,
                lastOpenAt: new Date().toISOString()
            };

            await db.createProject(newProject);
            useProjectStore.getState().addProject(newProject);
            return newProject;
        } catch (error) {
            console.error('Failed to create project:', error);
            throw error;
        }
    }


    public async deleteProject(projectId: string) {
        try {
            const db = await this.getDB();
            await db.deleteProject(projectId);
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
