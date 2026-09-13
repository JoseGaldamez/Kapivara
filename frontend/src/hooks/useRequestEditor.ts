import type { RequestAuthConfig, RequestBodyType, RequestHeader, RequestInfo, RequestParam } from "@/types";
import { useRequestStore } from "@/stores/request.store";
import { useCallback, useState } from "react";

const parseArray = <T,>(value: unknown): T[] => {
    if (Array.isArray(value)) return value as T[];
    if (typeof value !== "string" || !value) return [];
    try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? parsed as T[] : [];
    } catch {
        return [];
    }
};

const parseAuth = (value: unknown): RequestAuthConfig => {
    if (!value) return { auth_type: "none" };
    try {
        const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
        if (typeof parsed === "object" && parsed !== null && "auth_type" in parsed) {
            return parsed as RequestAuthConfig;
        }
    } catch {
        // Invalid persisted values safely fall back to no authentication.
    }
    return { auth_type: "none" };
};

export const useRequestEditor = (request: RequestInfo) => {
    const [method, setMethod] = useState(request.method || "GET");
    const [url, setUrl] = useState(request.url || "");
    const [body, setBody] = useState(request.body || "");
    const [bodyType, setBodyType] = useState<RequestBodyType>(request.body_type || "none");
    const [queryParams, setQueryParams] = useState<RequestParam[]>(() => parseArray<RequestParam>(request.params));
    const [headers, setHeaders] = useState<RequestHeader[]>(() => parseArray<RequestHeader>(request.headers));
    const [auth, setAuth] = useState<RequestAuthConfig>(() => parseAuth(request.auth));

    const markDirty = useCallback((updates: Partial<RequestInfo>) => {
        useRequestStore.getState().updateRequest({
            id: request.id,
            project_id: request.project_id,
            ...updates,
            is_dirty: true,
        });
    }, [request.id, request.project_id]);

    const updateMethod = useCallback((nextMethod: string) => {
        setMethod(nextMethod);
        markDirty({ method: nextMethod });
    }, [markDirty]);

    const updateUrl = useCallback((nextUrl: string) => {
        const queryStart = nextUrl.indexOf("?");
        if (queryStart < 0) {
            setUrl(nextUrl);
            markDirty({ url: nextUrl });
            return;
        }

        const baseUrl = nextUrl.slice(0, queryStart);
        const searchParams = new URLSearchParams(nextUrl.slice(queryStart + 1));
        setUrl(baseUrl);
        setQueryParams((currentParams) => {
            const nextParams = Array.from(searchParams.entries()).map(([key, value]) => {
                const existing = currentParams.find((param) => param.key === key && param.value === value);
                return {
                    id: existing?.id || crypto.randomUUID(),
                    request_id: request.id,
                    key,
                    value,
                    description: existing?.description || "",
                    is_active: 1,
                } satisfies RequestParam;
            });
            markDirty({ url: baseUrl, params: JSON.stringify(nextParams) });
            return nextParams;
        });
    }, [markDirty, request.id]);

    const updateBody = useCallback((nextBody: string) => {
        setBody(nextBody);
        markDirty({ body: nextBody });
    }, [markDirty]);

    const updateBodyType = useCallback((nextType: RequestBodyType) => {
        setBodyType(nextType);
        markDirty({ body_type: nextType });
    }, [markDirty]);

    const updateParams = useCallback((nextParams: RequestParam[]) => {
        setQueryParams(nextParams);
        markDirty({ params: JSON.stringify(nextParams) });
    }, [markDirty]);

    const updateHeaders = useCallback((nextHeaders: RequestHeader[]) => {
        setHeaders(nextHeaders);
        markDirty({ headers: JSON.stringify(nextHeaders) });
    }, [markDirty]);

    const updateAuth = useCallback((nextAuth: RequestAuthConfig) => {
        setAuth(nextAuth);
        markDirty({ auth: JSON.stringify(nextAuth) });
    }, [markDirty]);

    return {
        method,
        url,
        body,
        bodyType,
        queryParams,
        headers,
        auth,
        updateMethod,
        updateUrl,
        updateBody,
        updateBodyType,
        updateParams,
        updateHeaders,
        updateAuth,
    };
};
