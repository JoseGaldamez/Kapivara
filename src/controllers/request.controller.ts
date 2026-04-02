import RequestService from "../services/request.service";
import { RequestInfo, RequestResponse, Collection, SavedResponse } from "@/types";
import { useRequestStore } from "@/stores/request.store";
import { useConsoleStore } from "@/stores/console.store";
import { invoke } from "@tauri-apps/api/core";
import { environmentController } from "@/controllers/environment.controller";
import { resolveTemplateString, resolveVariablesInUnknown } from "@/utils/environment-resolver";

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
            await environmentController.forceRefreshForProject(request.project_id);
            const activeVariables = await environmentController.getResolvedVariables(request.project_id);

            // Parse Params
            let paramsArray: any[] = [];
            try {
                paramsArray = typeof request.params === 'string' ? JSON.parse(request.params) : request.params;
            } catch (e) {
                paramsArray = [];
            }
            if (!Array.isArray(paramsArray)) paramsArray = [];

            const activeParams = paramsArray.filter(p => p.is_active !== 0 && p.key);
            let finalUrl = resolveTemplateString(request.url, activeVariables);
            if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
                finalUrl = 'https://' + finalUrl;
            }
            if (activeParams.length > 0) {
                const searchParams = new URLSearchParams();
                activeParams.forEach(p => {
                    searchParams.append(
                        resolveTemplateString(p.key, activeVariables),
                        resolveTemplateString(p.value || '', activeVariables)
                    );
                });
                finalUrl += (finalUrl.includes('?') ? '&' : '?') + searchParams.toString();
            }

            // Setup Headers
            const headers: Record<string, string> = {};

            let headersArray: any[] = [];
            try {
                headersArray = typeof request.headers === 'string' ? JSON.parse(request.headers) : request.headers;
            } catch (e) {
                headersArray = [];
            }
            if (Array.isArray(headersArray)) {
                const activeHeaders = headersArray.filter(h => h.is_active !== 0 && h.key);
                activeHeaders.forEach(h => {
                    const headerKey = resolveTemplateString(h.key, activeVariables);
                    headers[headerKey] = resolveTemplateString(h.value || '', activeVariables);
                });
            }

            // Handle Authorization
            let authObj: any = null;
            try {
                authObj = typeof request.auth === 'string' ? JSON.parse(request.auth) : request.auth;
            } catch (e) { }
            authObj = resolveVariablesInUnknown(authObj, activeVariables);

            if (authObj && authObj.auth_type !== 'none') {
                let authData: any = {};
                try {
                    authData = typeof authObj.auth_data === 'string' ? JSON.parse(authObj.auth_data) : authObj.auth_data;
                } catch (e) { }

                if (authObj.auth_type === 'bearer' && authData?.token) {
                    headers['Authorization'] = `Bearer ${authData.token}`;
                } else if (authObj.auth_type === 'basic' && (authData?.username || authData?.password)) {
                    const credentials = `${authData.username || ''}:${authData.password || ''}`;
                    headers['Authorization'] = `Basic ${btoa(credentials)}`;
                } else if (authObj.auth_type === 'apikey' && authData?.key && authData?.value) {
                    if (authData.add_to === 'query') {
                        const separator = finalUrl.includes('?') ? '&' : '?';
                        finalUrl += `${separator}${encodeURIComponent(resolveTemplateString(authData.key, activeVariables))}=${encodeURIComponent(resolveTemplateString(authData.value, activeVariables))}`;
                    } else {
                        // Default to header
                        headers[resolveTemplateString(authData.key, activeVariables)] = resolveTemplateString(authData.value, activeVariables);
                    }
                } // wait for more auth types
            }

            let finalBody = request.body ? resolveTemplateString(request.body, activeVariables) : null;
            if (request.body_type === 'form-data' && request.body) {
                let formDataItems: any[] = [];
                try {
                    formDataItems = JSON.parse(request.body);
                } catch (e) { }

                if (Array.isArray(formDataItems)) {
                    finalBody = JSON.stringify(
                        formDataItems.map((item) => ({
                            ...item,
                            key: resolveTemplateString(item.key || '', activeVariables),
                            value: resolveTemplateString(item.value || '', activeVariables)
                        }))
                    );
                }
            }

            if (request.body_type === 'x-www-form-urlencoded' && request.body) {
                let items: any[] = [];
                try {
                    items = JSON.parse(request.body);
                } catch (e) { }

                if (Array.isArray(items)) {
                    const params = new URLSearchParams();
                    items.forEach(item => {
                        if (item.is_active !== 0 && item.key) {
                            params.append(
                                resolveTemplateString(item.key, activeVariables),
                                resolveTemplateString(item.value || '', activeVariables)
                            );
                        }
                    });
                    finalBody = params.toString();
                    headers['Content-Type'] = 'application/x-www-form-urlencoded';
                }
            }

            const response = await invoke<RequestResponse>('make_http_request', {
                method: request.method,
                url: finalUrl,
                headers,
                body: finalBody,
                bodyType: request.body_type || null
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

            // Push to console log
            const contentType = Object.entries(response.headers).find(
                ([k]) => k.toLowerCase() === 'content-type'
            )?.[1] ?? '';
            useConsoleStore.getState().push({
                requestName: request.name,
                method: request.method,
                url: finalUrl,
                timestamp: Date.now(),
                status: response.status,
                statusText: response.status_text,
                time_ms: response.time_ms,
                responseBody: response.body,
                responseHeaders: response.headers,
                isHtml: contentType.includes('text/html'),
            });

            // Persist the new response to SQLite database
            await this.updateRequest(request.id, request.project_id, updates);

            return response;
        } catch (error: any) {
            console.error('Failed to execute request:', error);

            const errorResponse: RequestResponse = {
                status: 0,
                status_text: "Connection Error",
                headers: {},
                body: typeof error === 'string' ? error : error?.message || String(error),
                time_ms: 0
            };

            const updates: Partial<RequestInfo> = {
                url: request.url,
                method: request.method,
                response: errorResponse,
                body_type: request.body_type,
                body: request.body
            };

            useRequestStore.getState().updateRequest({
                id: request.id,
                project_id: request.project_id,
                ...updates
            });

            // Push error to console log
            useConsoleStore.getState().push({
                requestName: request.name,
                method: request.method,
                url: request.url,
                timestamp: Date.now(),
                status: 0,
                statusText: 'Connection Error',
                time_ms: 0,
                responseBody: errorResponse.body,
                responseHeaders: {},
                isHtml: false,
            });

            await this.updateRequest(request.id, request.project_id, updates);

            throw errorResponse;
        }
    }

    public async deleteRequest(requestId: string, projectId: string): Promise<void> {
        try {
            const service = await this.getService();
            await service.deleteRequest(requestId);
            useRequestStore.getState().removeRequest(projectId, requestId);
        } catch (error) {
            console.error('Failed to delete request:', error);
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

    public async getSavedResponses(requestId: string): Promise<SavedResponse[]> {
        try {
            const service = await this.getService();
            const responses = await service.getSavedResponses(requestId);
            useRequestStore.getState().setSavedResponses(requestId, responses);
            return responses;
        } catch (error) {
            console.error('Failed to get saved responses:', error);
            return [];
        }
    }

    public async saveCurrentResponse(requestId: string, name: string, response: RequestResponse): Promise<void> {
        try {
            const service = await this.getService();
            const saved: SavedResponse = {
                id: crypto.randomUUID(),
                request_id: requestId,
                name,
                status: response.status,
                status_text: response.status_text,
                headers: JSON.stringify(response.headers),
                body: response.body,
                time_ms: response.time_ms,
            };
            await service.saveResponse(saved);
            useRequestStore.getState().addSavedResponse(saved);
        } catch (error) {
            console.error('Failed to save response:', error);
            throw error;
        }
    }

    public async deleteSavedResponse(requestId: string, id: string): Promise<void> {
        try {
            const service = await this.getService();
            await service.deleteSavedResponse(id);
            useRequestStore.getState().removeSavedResponse(requestId, id);
        } catch (error) {
            console.error('Failed to delete saved response:', error);
            throw error;
        }
    }
}


export const requestController = new RequestController();
