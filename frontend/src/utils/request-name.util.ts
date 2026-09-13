/**
 * Utility functions for automatic and custom request naming.
 */

/**
 * Extracts the endpoint path from a URL, stripping base variables (e.g. {{baseUrl}}),
 * protocols/domains, query params, and hashes.
 */
export function extractPathFromUrl(url: string): string {
    if (!url) return "";
    let cleaned = url.trim();

    // 1. Strip leading template variables like {{baseUrl}} or {{host}}
    cleaned = cleaned.replace(/^\{\{\s*[\w.-]+\s*\}\}/, "");

    // 2. Strip protocol and domain if full URL is given (e.g. http://localhost:8080/users)
    if (/^https?:\/\//i.test(cleaned)) {
        try {
            const parsed = new URL(cleaned);
            cleaned = parsed.pathname || "";
        } catch {
            cleaned = cleaned.replace(/^https?:\/\/[^/]+/, "");
        }
    }

    // 3. Remove query parameters and hashes
    const qIndex = cleaned.indexOf("?");
    if (qIndex !== -1) {
        cleaned = cleaned.slice(0, qIndex);
    }
    const hIndex = cleaned.indexOf("#");
    if (hIndex !== -1) {
        cleaned = cleaned.slice(0, hIndex);
    }

    // 4. Ensure it starts with / if not empty
    if (cleaned && !cleaned.startsWith("/")) {
        cleaned = "/" + cleaned;
    }

    return cleaned;
}

/**
 * Computes the display name for a request.
 * - If a custom name is defined by the user (non-empty and not "Untitled Request"), that is used.
 * - Otherwise, if a valid path exists (e.g. /users), returns "[METHOD] [path]" (e.g. "GET /users").
 * - If path is empty or just "/", returns the custom name or "Untitled Request".
 */
export function getRequestDisplayName(request: {
    name?: string;
    method?: string;
    url?: string;
}): string {
    const trimmedName = request.name?.trim() || "";

    // If user explicitly gave a custom name
    if (trimmedName && trimmedName !== "Untitled Request") {
        return trimmedName;
    }

    const path = extractPathFromUrl(request.url || "");
    if (path && path !== "/") {
        const method = request.method || "GET";
        return `${method} ${path}`;
    }

    return trimmedName || "Untitled Request";
}
