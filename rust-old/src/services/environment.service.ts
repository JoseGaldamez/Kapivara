import DBService from './db.service';
import { Environment, EnvironmentScope } from '@/types';

class EnvironmentService {
    private static instance: EnvironmentService;
    private dbService: DBService | null = null;

    private constructor() { }

    public static async getInstance(): Promise<EnvironmentService> {
        if (!EnvironmentService.instance) {
            const inst = new EnvironmentService();
            inst.dbService = await DBService.getInstance();
            EnvironmentService.instance = inst;
        }
        return EnvironmentService.instance;
    }

    private async getDB() {
        if (!this.dbService) {
            this.dbService = await DBService.getInstance();
        }
        return this.dbService;
    }

    public async getProjectEnvironments(projectId: string): Promise<Environment[]> {
        const db = await this.getDB();
        const query = `
            SELECT id, project_id, name, variables, created_at, 'project' as scope
            FROM environments
            WHERE project_id = $1
            ORDER BY created_at DESC
        `;
        return await db.select<Environment[]>(query, [projectId]);
    }

    public async getGlobalEnvironments(): Promise<Environment[]> {
        const db = await this.getDB();
        const query = `
            SELECT id, NULL as project_id, name, variables, created_at, 'global' as scope
            FROM global_environments
            ORDER BY created_at DESC
        `;
        return await db.select<Environment[]>(query);
    }

    public async createEnvironment(scope: EnvironmentScope, name: string, projectId?: string): Promise<Environment> {
        const db = await this.getDB();
        const id = crypto.randomUUID();
        const variables = '[]';

        if (scope === 'project') {
            if (!projectId) throw new Error('projectId is required for project environment');
            await db.execute(
                `INSERT INTO environments (id, project_id, name, variables) VALUES ($1, $2, $3, $4)`,
                [id, projectId, name, variables]
            );
            return {
                id,
                scope,
                project_id: projectId,
                name,
                variables
            };
        }

        await db.execute(
            `INSERT INTO global_environments (id, name, variables) VALUES ($1, $2, $3)`,
            [id, name, variables]
        );

        return {
            id,
            scope,
            project_id: null,
            name,
            variables
        };
    }

    public async renameEnvironment(scope: EnvironmentScope, environmentId: string, name: string): Promise<void> {
        const db = await this.getDB();
        const table = scope === 'project' ? 'environments' : 'global_environments';
        await db.execute(`UPDATE ${table} SET name = $1 WHERE id = $2`, [name, environmentId]);
    }

    public async updateEnvironmentVariables(scope: EnvironmentScope, environmentId: string, variables: string): Promise<void> {
        const db = await this.getDB();
        const table = scope === 'project' ? 'environments' : 'global_environments';
        await db.execute(`UPDATE ${table} SET variables = $1 WHERE id = $2`, [variables, environmentId]);
    }

    public async deleteEnvironment(scope: EnvironmentScope, environmentId: string): Promise<void> {
        const db = await this.getDB();
        if (scope === 'project') {
            await db.execute(`DELETE FROM environments WHERE id = $1`, [environmentId]);
            return;
        }
        await db.execute(`DELETE FROM global_environments WHERE id = $1`, [environmentId]);
    }

    public async getActiveProjectEnvironment(projectId: string): Promise<string | null> {
        const db = await this.getDB();
        const result = await db.select<Array<{ environment_id: string | null }>>(
            `SELECT environment_id FROM active_project_environments WHERE project_id = $1 LIMIT 1`,
            [projectId]
        );

        return result?.[0]?.environment_id ?? null;
    }

    public async setActiveProjectEnvironment(projectId: string, environmentId: string | null): Promise<void> {
        const db = await this.getDB();
        if (!environmentId) {
            await db.execute(`DELETE FROM active_project_environments WHERE project_id = $1`, [projectId]);
            return;
        }

        await db.execute(
            `
            INSERT INTO active_project_environments (project_id, environment_id)
            VALUES ($1, $2)
            ON CONFLICT(project_id) DO UPDATE SET environment_id = excluded.environment_id
            `,
            [projectId, environmentId]
        );
    }

    public async getActiveGlobalEnvironment(): Promise<string | null> {
        const db = await this.getDB();
        const result = await db.select<Array<{ environment_id: string | null }>>(
            `SELECT environment_id FROM active_global_environment WHERE id = 1 LIMIT 1`
        );
        return result?.[0]?.environment_id ?? null;
    }

    public async setActiveGlobalEnvironment(environmentId: string | null): Promise<void> {
        const db = await this.getDB();
        await db.execute(
            `
            INSERT INTO active_global_environment (id, environment_id)
            VALUES (1, $1)
            ON CONFLICT(id) DO UPDATE SET environment_id = excluded.environment_id
            `,
            [environmentId]
        );
    }
}

export default EnvironmentService;

