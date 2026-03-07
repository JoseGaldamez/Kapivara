import RequestService from "../services/request.service";
import { RequestInfo, RequestResponse, Collection } from "@/types";
import { useRequestStore } from "@/stores/request.store";
import { invoke } from "@tauri-apps/api/core";

class RequestController {
    private service: RequestService | null = null;

    private async getService() {
        if (!this.service) {
            this.service = await RequestService.getInstance();
        }
        return this.service;
    }

    public async getRequests(projectId: string): Promise<RequestInfo[]> {
        try {
            const service = await this.getService();
            const requests = await service.getRequests(projectId);
            useRequestStore.getState().setRequests(projectId, requests);
            return requests;
        } catch (error) {
            console.error('Failed to get requests:', error);
            return [];
        }
    }

    public async createRequest(projectId: string, name: string, method: string, collectionId?: string): Promise<RequestInfo> {
        try {
            const service = await this.getService();
            const newRequest: RequestInfo = {
                id: crypto.randomUUID(),
                project_id: projectId,
                name,
                method,
                url: '',
                collection_id: collectionId || null
            };
            await service.createRequest(newRequest);
            useRequestStore.getState().addRequest(newRequest);
            return newRequest;
        } catch (error) {
            console.error('Failed to create request:', error);
            throw error;
        }
    }

    public async getCollections(projectId: string): Promise<Collection[]> {
        try {
            const service = await this.getService();
            const collections = await service.getCollections(projectId);
            useRequestStore.getState().setCollections(projectId, collections);
            return collections;
        } catch (error) {
            console.error('Failed to get collections:', error);
            return [];
        }
    }

    public async createCollection(projectId: string, name: string, parentId?: string): Promise<Collection> {
        try {
            const service = await this.getService();
            const newCollection: Collection = {
                id: crypto.randomUUID(),
                project_id: projectId,
                name,
                parent_id: parentId || null
            };
            await service.createCollection(newCollection);
            useRequestStore.getState().addCollection(newCollection);
            return newCollection;
        } catch (error) {
            console.error('Failed to create collection:', error);
            throw error;
        }
    }

    public async updateRequestMethod(requestId: string, projectId: string, method: string) {
        try {
            const service = await this.getService();
            await service.updateRequest({ id: requestId, method });
            useRequestStore.getState().updateRequest({ id: requestId, project_id: projectId, method });
        } catch (error) {
            console.error('Failed to update request method:', error);
        }
    }

    public async executeRequest(request: RequestInfo): Promise<RequestResponse> {
        try {
            // TODO: Get environment variables and set headers, body, etc
            const response = await invoke<RequestResponse>('make_http_request', {
                method: request.method,
                url: request.url + request.params,
                headers: {},
                body: request.body || null
            });

            // Save response to store and database
            const updates: Partial<RequestInfo> = {
                url: request.url,
                method: request.method,
                response: response,
                body_type: request.body_type,
                body: request.body
            };
            
            useRequestStore.getState().updateRequest({
                id: request.id,
                project_id: request.project_id,
                ...updates
            });
            
            // Persist the new response to SQLite database
            await this.updateRequest(request.id, request.project_id, updates);

            return response;
        } catch (error) {
            console.error('Failed to execute request:', error);
            throw error;
        }
    }

    public async updateRequest(requestId: string, projectId: string, updates: Partial<RequestInfo>) {
        try {
            const service = await this.getService();
            await service.updateRequest({ id: requestId, ...updates });
            useRequestStore.getState().updateRequest({ id: requestId, project_id: projectId, ...updates, is_dirty: false });
        } catch (error) {
            console.error('Failed to update request:', error);
        }
    }
}


export const requestController = new RequestController();
