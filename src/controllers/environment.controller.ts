import { Environment, EnvironmentScope, EnvironmentVariable } from '@/types';
import EnvironmentService from '@/services/environment.service';
import { useEnvironmentStore } from '@/stores/environment.store';

class EnvironmentController {
    private service: EnvironmentService | null = null;
    private initializedProjects = new Set<string>();
    private isGlobalInitialized = false;

    private async getService() {
        if (!this.service) {
            this.service = await EnvironmentService.getInstance();
        }
        return this.service;
    }

    private parseEnvironmentVariables(environment: Environment | null | undefined): EnvironmentVariable[] {
        if (!environment?.variables) return [];
        try {
            const parsed = JSON.parse(environment.variables);
            if (!Array.isArray(parsed)) return [];
            return parsed.filter((row) => row?.key).map((row) => ({
                id: row.id || crypto.randomUUID(),
                key: row.key,
                value: row.value || '',
                enabled: row.enabled === 0 ? 0 : 1
            }));
        } catch {
            return [];
        }
    }

    public async bootstrap(projectId: string) {
        const tasks: Promise<unknown>[] = [];

        if (!this.initializedProjects.has(projectId)) {
            tasks.push(this.loadProjectEnvironments(projectId));
            tasks.push(this.loadActiveProjectEnvironment(projectId));
            this.initializedProjects.add(projectId);
        }

        if (!this.isGlobalInitialized) {
            tasks.push(this.loadGlobalEnvironments());
            tasks.push(this.loadActiveGlobalEnvironment());
            this.isGlobalInitialized = true;
        }

        if (tasks.length > 0) {
            await Promise.all(tasks);
        }
    }

    public async loadProjectEnvironments(projectId: string) {
        try {
            const service = await this.getService();
            const environments = await service.getProjectEnvironments(projectId);
            useEnvironmentStore.getState().setProjectEnvironments(projectId, environments);
            return environments;
        } catch (error) {
            console.error('Failed to load project environments:', error);
            return [];
        }
    }

    public async loadGlobalEnvironments() {
        try {
            const service = await this.getService();
            const environments = await service.getGlobalEnvironments();
            useEnvironmentStore.getState().setGlobalEnvironments(environments);
            return environments;
        } catch (error) {
            console.error('Failed to load global environments:', error);
            return [];
        }
    }

    public async loadActiveProjectEnvironment(projectId: string) {
        try {
            const service = await this.getService();
            const activeId = await service.getActiveProjectEnvironment(projectId);
            useEnvironmentStore.getState().setActiveProjectEnvironment(projectId, activeId);
            return activeId;
        } catch (error) {
            console.error('Failed to load active project environment:', error);
            return null;
        }
    }

    public async loadActiveGlobalEnvironment() {
        try {
            const service = await this.getService();
            const activeId = await service.getActiveGlobalEnvironment();
            useEnvironmentStore.getState().setActiveGlobalEnvironment(activeId);
            return activeId;
        } catch (error) {
            console.error('Failed to load active global environment:', error);
            return null;
        }
    }

    public async createEnvironment(scope: EnvironmentScope, name: string, projectId?: string) {
        const service = await this.getService();
        const created = await service.createEnvironment(scope, name.trim(), projectId);

        if (scope === 'project' && projectId) {
            await Promise.all([
                this.loadProjectEnvironments(projectId),
                this.setActiveEnvironment('project', created.id, projectId)
            ]);
        } else {
            await Promise.all([
                this.loadGlobalEnvironments(),
                this.setActiveEnvironment('global', created.id)
            ]);
        }

        return created;
    }

    public async renameEnvironment(scope: EnvironmentScope, environmentId: string, name: string, projectId?: string) {
        const service = await this.getService();
        await service.renameEnvironment(scope, environmentId, name.trim());

        if (scope === 'project' && projectId) {
            await this.loadProjectEnvironments(projectId);
        } else {
            await this.loadGlobalEnvironments();
        }
    }

    public async updateEnvironmentVariables(scope: EnvironmentScope, environmentId: string, variables: EnvironmentVariable[], projectId?: string) {
        const service = await this.getService();
        await service.updateEnvironmentVariables(scope, environmentId, JSON.stringify(variables));

        if (scope === 'project' && projectId) {
            await this.loadProjectEnvironments(projectId);
        } else {
            await this.loadGlobalEnvironments();
        }
    }

    public async deleteEnvironment(scope: EnvironmentScope, environmentId: string, projectId?: string) {
        const service = await this.getService();
        await service.deleteEnvironment(scope, environmentId);

        if (scope === 'project' && projectId) {
            const active = useEnvironmentStore.getState().activeProjectEnvironmentIdByProject[projectId];
            if (active === environmentId) {
                await this.setActiveEnvironment('project', null, projectId);
            }
            await this.loadProjectEnvironments(projectId);
            return;
        }

        const activeGlobal = useEnvironmentStore.getState().activeGlobalEnvironmentId;
        if (activeGlobal === environmentId) {
            await this.setActiveEnvironment('global', null);
        }
        await this.loadGlobalEnvironments();
    }

    public async setActiveEnvironment(scope: EnvironmentScope, environmentId: string | null, projectId?: string) {
        const service = await this.getService();

        if (scope === 'project') {
            if (!projectId) throw new Error('projectId is required for project environment');
            await service.setActiveProjectEnvironment(projectId, environmentId);
            useEnvironmentStore.getState().setActiveProjectEnvironment(projectId, environmentId);
            return;
        }

        await service.setActiveGlobalEnvironment(environmentId);
        useEnvironmentStore.getState().setActiveGlobalEnvironment(environmentId);
    }

    public async forceRefreshForProject(projectId: string): Promise<void> {
        await Promise.all([
            this.loadProjectEnvironments(projectId),
            this.loadGlobalEnvironments(),
            this.loadActiveProjectEnvironment(projectId),
            this.loadActiveGlobalEnvironment(),
        ]);
    }

    public async getResolvedVariables(projectId: string): Promise<Record<string, string>> {
        const freshState = useEnvironmentStore.getState();

        const activeProjectId = freshState.activeProjectEnvironmentIdByProject[projectId] ?? null;
        const activeGlobalId = freshState.activeGlobalEnvironmentId;

        const projectEnvironment = activeProjectId
            ? (freshState.projectEnvironmentsByProject[projectId] || []).find((env) => env.id === activeProjectId)
            : undefined;
        const globalEnvironment = activeGlobalId
            ? freshState.globalEnvironments.find((env) => env.id === activeGlobalId)
            : undefined;

        const globalVariables = this.parseEnvironmentVariables(globalEnvironment);
        const projectVariables = this.parseEnvironmentVariables(projectEnvironment);

        const result: Record<string, string> = {};
        globalVariables.forEach((variable) => {
            if (variable.enabled === 1) {
                result[variable.key] = variable.value;
            }
        });
        projectVariables.forEach((variable) => {
            if (variable.enabled === 1) {
                result[variable.key] = variable.value;
            }
        });

        return result;
    }
}

export const environmentController = new EnvironmentController();


