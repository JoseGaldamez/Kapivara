import RequestService from "../services/request.service";
import { RequestInfo, RequestResponse } from "@/types";
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

    public async createRequest(projectId: string, name: string, method: string): Promise<RequestInfo> {
        try {
            const service = await this.getService();
            const newRequest: RequestInfo = {
                id: crypto.randomUUID(),
                project_id: projectId,
                name,
                method,
                url: '',
                collection_id: null
            };
            await service.createRequest(newRequest);
            useRequestStore.getState().addRequest(newRequest);
            return newRequest;
        } catch (error) {
            console.error('Failed to create request:', error);
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
                url: request.url,
                headers: {},
                body: null
            });

            // Save response to store. TODO: Should it be saved on the database? 
            useRequestStore.getState().updateRequest({
                id: request.id,
                project_id: request.project_id,
                url: request.url,
                method: request.method,
                response: response
            });

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
            useRequestStore.getState().updateRequest({ id: requestId, project_id: projectId, ...updates });
        } catch (error) {
            console.error('Failed to update request:', error);
        }
    }
}


export const requestController = new RequestController();
