import { create } from 'zustand';
import { RequestInfo } from '../types';

interface RequestState {
    // State
    requests: RequestInfo[]; // We might want to store by project, but for now flat list filtered by current view is simplest or store all loaded. 
    // Optimization: Store a map: { [projectId]: RequestInfo[] }
    requestsByProject: Record<string, RequestInfo[]>;

    // Actions
    setRequests: (projectId: string, requests: RequestInfo[]) => void;
    addRequest: (request: RequestInfo) => void;
    updateRequest: (request: Partial<RequestInfo> & { id: string; project_id: string }) => void;
}

export const useRequestStore = create<RequestState>((set) => ({
    requestsByProject: {},
    requests: [],

    setRequests: (projectId, requests) => set((state) => ({
        requestsByProject: {
            ...state.requestsByProject,
            [projectId]: requests
        }
    })),

    addRequest: (request) => set((state) => ({
        requestsByProject: {
            ...state.requestsByProject,
            [request.project_id]: [request, ...(state.requestsByProject[request.project_id] || [])]
        }
    })),

    updateRequest: ({ id, project_id, ...updates }) => set((state) => {
        const projectRequests = state.requestsByProject[project_id] || [];
        const updatedRequests = projectRequests.map(req =>
            req.id === id ? { ...req, ...updates } : req
        );

        return {
            requestsByProject: {
                ...state.requestsByProject,
                [project_id]: updatedRequests
            }
        };
    })
}));
