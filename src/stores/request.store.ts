import { create } from 'zustand';
import { RequestInfo, Collection } from '../types';

//TODO: Should we store metadata like active tab, height of response panel, response time, etc?
interface RequestState {
    // State
    requests: RequestInfo[];
    requestsByProject: Record<string, RequestInfo[]>;
    collectionsByProject: Record<string, Collection[]>;
    activeRequestIdByProject: Record<string, string | null>;

    // Actions
    setActiveRequest: (projectId: string, requestId: string | null) => void;
    setRequests: (projectId: string, requests: RequestInfo[]) => void;
    setCollections: (projectId: string, collections: Collection[]) => void;
    addRequest: (request: RequestInfo) => void;
    addCollection: (collection: Collection) => void;
    updateRequest: (request: Partial<RequestInfo> & { id: string; project_id: string }) => void;
}

export const useRequestStore = create<RequestState>((set) => ({
    requestsByProject: {},
    collectionsByProject: {},
    activeRequestIdByProject: {},
    requests: [],

    setActiveRequest: (projectId, requestId) => set((state) => ({
        activeRequestIdByProject: {
            ...state.activeRequestIdByProject,
            [projectId]: requestId
        }
    })),

    setRequests: (projectId, requests) => set((state) => ({
        requestsByProject: {
            ...state.requestsByProject,
            [projectId]: requests
        }
    })),

    setCollections: (projectId, collections) => set((state) => ({
        collectionsByProject: {
            ...state.collectionsByProject,
            [projectId]: collections
        }
    })),

    addRequest: (request) => set((state) => ({
        requestsByProject: {
            ...state.requestsByProject,
            [request.project_id]: [request, ...(state.requestsByProject[request.project_id] || [])]
        }
    })),

    addCollection: (collection) => set((state) => ({
        collectionsByProject: {
            ...state.collectionsByProject,
            [collection.project_id]: [...(state.collectionsByProject[collection.project_id] || []), collection]
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
