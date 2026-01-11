import DBService from "./db.service";
import { Project } from "@/types";

class ProjectService {
    private static instance: ProjectService;
    private dbService: DBService | null = null;

    private constructor() { }

    public static async getInstance(): Promise<ProjectService> {
        if (!ProjectService.instance) {
            ProjectService.instance = new ProjectService();
            ProjectService.instance.dbService = await DBService.getInstance();
        }
        return ProjectService.instance;
    }

    public async getProjects(): Promise<Project[]> {
        if (!this.dbService) this.dbService = await DBService.getInstance();
        return await this.dbService.select<Project[]>('SELECT * FROM projects ORDER BY created_at DESC');
    }

    public async createProject(project: Project): Promise<void> {
        if (!this.dbService) this.dbService = await DBService.getInstance();
        const query = `
      INSERT INTO projects (uid, name, description, iconColor, lastOpenAt)
      VALUES ($1, $2, $3, $4, $5)
    `;
        await this.dbService.execute(query, [
            project.uid,
            project.name,
            project.description || '',
            project.iconColor || '',
            project.lastOpenAt || null
        ]);
    }

    public async deleteProject(projectId: string): Promise<void> {
        if (!this.dbService) this.dbService = await DBService.getInstance();
        await this.dbService.execute('DELETE FROM projects WHERE uid = $1', [projectId]);
    }
}

export default ProjectService;
