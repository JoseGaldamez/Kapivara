import { create } from 'zustand';
import { Project } from '../types';

export interface Tab {
    id: string;
    type: 'home' | 'project';
    projectId?: string;
    title: string;
    closable: boolean;
}

interface ProjectState {
    // State
    projects: Project[];
    tabs: Tab[];
    activeTabId: string;

    // Actions
    setProjects: (projects: Project[]) => void;
    addProject: (project: Project) => void;
    openProjectTab: (project: Project) => void;
    closeTab: (tabId: string) => void;
    setActiveTab: (tabId: string) => void;
    removeProject: (projectId: string) => void;

    isSettingsOpen: boolean;
    setSettingsOpen: (isOpen: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    tabs: [{ id: 'home', type: 'home', title: 'Home', closable: false }],
    activeTabId: 'home',

    setProjects: (projects) => set({ projects }),

    addProject: (project) => set((state) => ({
        projects: [project, ...state.projects]
    })),
    removeProject: (projectId) => set((state) => ({
        projects: state.projects.filter(project => project.uid !== projectId)
    })),
    openProjectTab: (project) => {
        const { tabs, setActiveTab } = get();
        const existingTab = tabs.find(t => t.projectId === project.uid);

        if (existingTab) {
            setActiveTab(existingTab.id);
            return;
        }

        const newTab: Tab = {
            id: `project-${project.uid}`,
            type: 'project',
            projectId: project.uid,
            title: project.name,
            closable: true
        };

        set({ tabs: [...tabs, newTab], activeTabId: newTab.id });
    },

    closeTab: (tabId) => {
        const { tabs, activeTabId } = get();
        const tabIndex = tabs.findIndex(t => t.id === tabId);

        if (tabIndex === -1) return;

        const newTabs = tabs.filter(t => t.id !== tabId);
        let newActiveId = activeTabId;

        if (activeTabId === tabId) {
            // If closing active tab, switch to the one to the left, or home
            const newIndex = tabIndex > 0 ? tabIndex - 1 : 0;
            newActiveId = newTabs[newIndex].id;
        }

        set({ tabs: newTabs, activeTabId: newActiveId });
    },

    setActiveTab: (tabId) => set({ activeTabId: tabId }),

    isSettingsOpen: false,
    setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen })
}));
