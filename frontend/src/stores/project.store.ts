import { create } from "zustand";
import { Project } from "../types";

interface ProjectState {
    projects: Project[];
    activeProjectId: string | null;
    setProjects: (projects: Project[]) => void;
    addProject: (project: Project) => void;
    selectProject: (projectId: string | null) => void;
    removeProject: (projectId: string) => void;
    updateProject: (projectId: string, updates: Partial<Project>) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
    projects: [],
    activeProjectId: null,

    setProjects: (projects) => set((state) => ({
        projects,
        activeProjectId: state.activeProjectId && projects.some((project) => project.uid === state.activeProjectId)
            ? state.activeProjectId
            : null,
    })),

    addProject: (project) => set((state) => ({
        projects: [project, ...state.projects],
    })),

    selectProject: (projectId) => set({ activeProjectId: projectId }),

    removeProject: (projectId) => set((state) => ({
        projects: state.projects.filter((project) => project.uid !== projectId),
        activeProjectId: state.activeProjectId === projectId ? null : state.activeProjectId,
    })),

    updateProject: (projectId, updates) => set((state) => ({
        projects: state.projects.map((project) =>
            project.uid === projectId ? { ...project, ...updates } : project
        ),
    })),
}));
