export interface Project {
    uid: string;
    name: string;
    description?: string;
    iconColor?: string;
    lastOpenAt?: string;
    created_at?: string;
}

export interface Environment {
    id: string;
    project_id: string;
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

export interface RequestResponse {
    status: number;
    status_text: string;
    headers: Record<string, string>;
    body: string;
    time_ms: number;
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
    auth?: string; // JSON string
    params?: string; // JSON string
    response?: RequestResponse | null;
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
    is_active: number;
}

export interface RequestBody {
    id: string;
    request_id: string;
    body_type: 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
    raw_data?: string;
}

export interface RequestAuth {
    id: string;
    request_id: string;
    auth_type: 'none' | 'bearer' | 'basic' | 'apikey';
    auth_data?: string; // JSON string
}
