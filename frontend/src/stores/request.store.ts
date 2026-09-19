import { create } from 'zustand';
import { RequestInfo, Collection, SavedResponse } from '../types';

export type LoadStatus = 'loading' | 'loaded' | 'error';

interface RequestState {
    // State
    requestsByProject: Record<string, RequestInfo[]>;
    collectionsByProject: Record<string, Collection[]>;
    activeRequestIdByProject: Record<string, string | null>;
    savedResponsesByRequest: Record<string, SavedResponse[]>;
    activeTabByRequest: Record<string, string>;
    lastActiveTab: string;
    projectLoadStatus: Record<string, LoadStatus>;
    requestDetailStatus: Record<string, LoadStatus>;
    requestResponseStatus: Record<string, LoadStatus>;

    // Actions
    setActiveRequest: (projectId: string, requestId: string | null) => void;
    setActiveTabForRequest: (requestId: string, tab: string) => void;
    setRequests: (projectId: string, requests: RequestInfo[]) => void;
    setProjectLoadStatus: (projectId: string, status: LoadStatus) => void;
    setRequestDetailStatus: (requestId: string, status: LoadStatus) => void;
    setRequestResponseStatus: (requestId: string, status: LoadStatus) => void;
    setCollections: (projectId: string, collections: Collection[]) => void;
    addRequest: (request: RequestInfo) => void;
    addCollection: (collection: Collection) => void;
    updateRequest: (request: Partial<RequestInfo> & { id: string; project_id: string }) => void;
    setSavedResponses: (requestId: string, responses: SavedResponse[]) => void;
    addSavedResponse: (response: SavedResponse) => void;
    removeSavedResponse: (requestId: string, id: string) => void;
    removeRequest: (projectId: string, requestId: string) => void;
}

export const useRequestStore = create<RequestState>((set) => ({
    requestsByProject: {},
    collectionsByProject: {},
    activeRequestIdByProject: {},
    savedResponsesByRequest: {},
    activeTabByRequest: {},
    lastActiveTab: 'Body',
    projectLoadStatus: {},
    requestDetailStatus: {},
    requestResponseStatus: {},
    setActiveRequest: (projectId, requestId) => set((state) => ({
        activeRequestIdByProject: {
            ...state.activeRequestIdByProject,
            [projectId]: requestId
        }
    })),

    setActiveTabForRequest: (requestId, tab) => set((state) => ({
        activeTabByRequest: {
            ...state.activeTabByRequest,
            [requestId]: tab
        },
        lastActiveTab: tab
    })),

    setRequests: (projectId, requests) => set((state) => {
        const existing = state.requestsByProject[projectId] ?? [];
        const existingById = new Map(existing.map((request) => [request.id, request]));
        const loadedIds = new Set(requests.map((request) => request.id));
        return {
            requestsByProject: {
                ...state.requestsByProject,
                [projectId]: [
                    ...requests.map((request) => ({ ...request, ...existingById.get(request.id) })),
                    ...existing.filter((request) => !loadedIds.has(request.id)),
                ],
            },
        };
    }),

    setProjectLoadStatus: (projectId, status) => set((state) => ({
        projectLoadStatus: { ...state.projectLoadStatus, [projectId]: status },
    })),

    setRequestDetailStatus: (requestId, status) => set((state) => ({
        requestDetailStatus: { ...state.requestDetailStatus, [requestId]: status },
    })),

    setRequestResponseStatus: (requestId, status) => set((state) => ({
        requestResponseStatus: { ...state.requestResponseStatus, [requestId]: status },
    })),

    setCollections: (projectId, collections) => set((state) => {
        const existing = state.collectionsByProject[projectId] ?? [];
        const existingById = new Map(existing.map((collection) => [collection.id, collection]));
        const loadedIds = new Set(collections.map((collection) => collection.id));
        return {
            collectionsByProject: {
                ...state.collectionsByProject,
                [projectId]: [
                    ...collections.map((collection) => ({ ...collection, ...existingById.get(collection.id) })),
                    ...existing.filter((collection) => !loadedIds.has(collection.id)),
                ],
            },
        };
    }),

    addRequest: (request) => set((state) => ({
        requestsByProject: {
            ...state.requestsByProject,
            [request.project_id]: [request, ...(state.requestsByProject[request.project_id] || [])]
        },
        requestDetailStatus: { ...state.requestDetailStatus, [request.id]: 'loaded' },
        requestResponseStatus: { ...state.requestResponseStatus, [request.id]: 'loaded' },
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
            },
            ...(updates.response !== undefined ? {
                requestResponseStatus: { ...state.requestResponseStatus, [id]: 'loaded' as const },
            } : {}),
        };
    }),

    setSavedResponses: (requestId, responses) => set((state) => {
        const existing = state.savedResponsesByRequest[requestId] ?? [];
        const loadedIds = new Set(responses.map((response) => response.id));
        return {
            savedResponsesByRequest: {
                ...state.savedResponsesByRequest,
                [requestId]: [...existing.filter((response) => !loadedIds.has(response.id)), ...responses],
            },
        };
    }),

    addSavedResponse: (response) => set((state) => ({
        savedResponsesByRequest: {
            ...state.savedResponsesByRequest,
            [response.request_id]: [response, ...(state.savedResponsesByRequest[response.request_id] || [])]
        }
    })),

    removeSavedResponse: (requestId: string, id: string) => set((state) => ({
        savedResponsesByRequest: {
            ...state.savedResponsesByRequest,
            [requestId]: (state.savedResponsesByRequest[requestId] || []).filter(r => r.id !== id)
        }
    })),

    removeRequest: (projectId, requestId) => set((state) => {
        const { [requestId]: _, ...restTabs } = state.activeTabByRequest;
        const { [requestId]: _detail, ...restDetailStatus } = state.requestDetailStatus;
        const { [requestId]: _response, ...restResponseStatus } = state.requestResponseStatus;
        return {
            requestsByProject: {
                ...state.requestsByProject,
                [projectId]: (state.requestsByProject[projectId] || []).filter(r => r.id !== requestId)
            },
            activeRequestIdByProject: {
                ...state.activeRequestIdByProject,
                [projectId]: state.activeRequestIdByProject[projectId] === requestId ? null : state.activeRequestIdByProject[projectId]
            },
            activeTabByRequest: restTabs,
            requestDetailStatus: restDetailStatus,
            requestResponseStatus: restResponseStatus,
        };
    }),
}));
