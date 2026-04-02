import DBService from "./db.service";
import { Project } from "@/types";

class ProjectService {
    private static instancePromise: Promise<ProjectService> | null = null;
    private dbService: DBService | null = null;

    private constructor() { }

    public static async getInstance(): Promise<ProjectService> {
        if (!ProjectService.instancePromise) {
            ProjectService.instancePromise = (async () => {
                const inst = new ProjectService();
                inst.dbService = await DBService.getInstance();
                return inst;
            })().catch(e => {
                ProjectService.instancePromise = null;
                throw e;
            });
        }
        return ProjectService.instancePromise;
    }

    public async getProjects(): Promise<Project[]> {
        return await DBService.getInstance().then(db => db.select<Project[]>('SELECT * FROM projects ORDER BY created_at DESC'));
    }

    public async createProject(project: Project): Promise<void> {
        const db = await DBService.getInstance();
        const query = `
      INSERT INTO projects (uid, name, description, iconColor, lastOpenAt)
      VALUES ($1, $2, $3, $4, $5)
    `;
        await db.execute(query, [
            project.uid,
            project.name,
            project.description || '',
            project.iconColor || '',
            project.lastOpenAt || null
        ]);
    }

    public async deleteProject(projectId: string): Promise<void> {
        const db = await DBService.getInstance();
        await db.execute('DELETE FROM projects WHERE uid = $1', [projectId]);
    }
}

export default ProjectService;
