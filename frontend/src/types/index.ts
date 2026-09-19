export interface Project {
    uid: string;
    name: string;
    description?: string;
    iconColor?: string;
    lastOpenAt?: string;
    created_at?: string;
}

export type EnvironmentScope = 'project' | 'global';

export interface EnvironmentVariable {
    id: string;
    key: string;
    value: string;
    enabled: number;
}

export interface Environment {
    id: string;
    project_id?: string | null;
    scope: EnvironmentScope;
    name: string;
    variables: string; // JSON string
    created_at?: string;
}

export interface Collection {
    id: string;
    project_id: string;
    parent_id?: string | null;
    name: string;
    created_at?: string;
}

export interface SavedResponse {
    id: string;
    request_id: string;
    name: string;
    status: number;
    status_text: string;
    headers: string; // JSON string
    body?: string;
    body_encoding?: 'text' | 'base64';
    content_type?: string;
    response_url?: string;
    size_bytes?: number;
    time_ms: number;
    created_at?: string;
}

export interface RequestResponse {
    status: number;
    status_text: string;
    headers: Record<string, string>;
    body: string;
    body_encoding?: 'text' | 'base64';
    content_type?: string;
    response_url?: string;
    size_bytes?: number;
    time_ms: number;
}

export type RequestBodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
export type RequestAuthType = 'none' | 'bearer' | 'basic' | 'apikey';

export interface RequestAuthConfig {
    auth_type: RequestAuthType;
    auth_data?: string | Record<string, string>;
}

export interface RequestInfo {
    id: string;
    collection_id?: string | null;
    project_id: string;
    name: string;
    method: string;
    url: string;
    headers?: string; // JSON string
    body?: string;
    body_type?: RequestBodyType;
    auth?: string; // JSON string
    params?: string; // JSON string
    response?: RequestResponse | null;
    is_dirty?: boolean;
    created_at?: string;
}

export interface RequestHeader {
    id: string;
    request_id: string;
    key: string;
    value: string;
    is_active: number;
}

export interface RequestParam {
    id: string;
    request_id: string;
    key: string;
    value: string;
    description?: string;
    is_active: number;
}

export interface RequestBody {
    id: string;
    request_id: string;
    body_type: RequestBodyType;
    raw_data?: string;
}

export interface RequestAuth {
    id: string;
    request_id: string;
    auth_type: RequestAuthType;
    auth_data?: string; // JSON string
}
