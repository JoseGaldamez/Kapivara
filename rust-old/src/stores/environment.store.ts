import { create } from 'zustand';
import { Environment } from '@/types';

interface EnvironmentState {
    projectEnvironmentsByProject: Record<string, Environment[]>;
    globalEnvironments: Environment[];
    activeProjectEnvironmentIdByProject: Record<string, string | null>;
    activeGlobalEnvironmentId: string | null;

    setProjectEnvironments: (projectId: string, environments: Environment[]) => void;
    setGlobalEnvironments: (environments: Environment[]) => void;
    setActiveProjectEnvironment: (projectId: string, environmentId: string | null) => void;
    setActiveGlobalEnvironment: (environmentId: string | null) => void;
}

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
    projectEnvironmentsByProject: {},
    globalEnvironments: [],
    activeProjectEnvironmentIdByProject: {},
    activeGlobalEnvironmentId: null,

    setProjectEnvironments: (projectId, environments) => set((state) => ({
        projectEnvironmentsByProject: {
            ...state.projectEnvironmentsByProject,
            [projectId]: environments
        }
    })),

    setGlobalEnvironments: (environments) => set({
        globalEnvironments: environments
    }),

    setActiveProjectEnvironment: (projectId, environmentId) => set((state) => ({
        activeProjectEnvironmentIdByProject: {
            ...state.activeProjectEnvironmentIdByProject,
            [projectId]: environmentId
        }
    })),

    setActiveGlobalEnvironment: (environmentId) => set({
        activeGlobalEnvironmentId: environmentId
    })
}));

