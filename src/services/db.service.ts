import Database from '@tauri-apps/plugin-sql';
import { Project, Environment, Collection, RequestInfo } from '../types';

class DBService {
    private static instance: DBService;
    private db: Database | null = null;
    private dbName = 'sqlite:kapivara.db';

    private constructor() { }

    public static async getInstance(): Promise<DBService> {
        if (!DBService.instance) {
            DBService.instance = new DBService();
            await DBService.instance.init();
        }
        return DBService.instance;
    }

    private async init() {
        this.db = await Database.load(this.dbName);
    }

    public async select<T>(query: string, args?: unknown[]): Promise<T> {
        if (!this.db) await this.init();
        return await this.db!.select<T>(query, args);
    }

    public async execute(query: string, args?: unknown[]): Promise<void> {
        if (!this.db) await this.init();
        await this.db!.execute(query, args);
    }

    // Projects
    public async getProjects(): Promise<Project[]> {
        if (!this.db) await this.init();
        return await this.db!.select<Project[]>('SELECT * FROM projects ORDER BY created_at DESC');
    }

    public async createProject(project: Project): Promise<void> {
        if (!this.db) await this.init();
        const query = `
      INSERT INTO projects (uid, name, description, iconColor, lastOpenAt)
      VALUES ($1, $2, $3, $4, $5)
    `;
        await this.db!.execute(query, [
            project.uid,
            project.name,
            project.description || '',
            project.iconColor || '',
            project.lastOpenAt || null
        ]);
    }

    public async deleteProject(projectId: string): Promise<void> {
        if (!this.db) await this.init();
        await this.db!.execute('DELETE FROM projects WHERE uid = $1', [projectId]);
    }

    // Environments
    public async getEnvironments(projectId: string): Promise<Environment[]> {
        if (!this.db) await this.init();
        return await this.db!.select<Environment[]>('SELECT * FROM environments WHERE project_id = $1', [projectId]);
    }

    public async createEnvironment(env: Environment): Promise<void> {
        if (!this.db) await this.init();
        const query = `
      INSERT INTO environments (id, project_id, name, variables)
      VALUES ($1, $2, $3, $4)
    `;
        await this.db!.execute(query, [env.id, env.project_id, env.name, env.variables]);
    }

    // Collections
    public async getCollections(projectId: string): Promise<Collection[]> {
        if (!this.db) await this.init();
        return await this.db!.select<Collection[]>('SELECT * FROM collections WHERE project_id = $1', [projectId]);
    }

    public async createCollection(collection: Collection): Promise<void> {
        if (!this.db) await this.init();
        const query = `
      INSERT INTO collections (id, project_id, parent_id, name)
      VALUES ($1, $2, $3, $4)
    `;
        await this.db!.execute(query, [collection.id, collection.project_id, collection.parent_id, collection.name]);
    }

    // Requests
    public async getRequests(projectId: string): Promise<RequestInfo[]> {
        if (!this.db) await this.init();
        return await this.db!.select<RequestInfo[]>('SELECT * FROM requests WHERE project_id = $1', [projectId]);
    }

    public async createRequest(request: RequestInfo): Promise<void> {
        if (!this.db) await this.init();
        const query = `
      INSERT INTO requests (id, collection_id, project_id, name, method, url)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
        await this.db!.execute(query, [
            request.id,
            request.collection_id,
            request.project_id,
            request.name,
            request.method,
            request.url
        ]);
    }
}

export default DBService;
