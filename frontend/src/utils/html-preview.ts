interface HtmlResponseData {
    content_type?: string;
    headers: Record<string, string>;
    body_encoding?: 'text' | 'base64';
}

const previewPolicy = [
    "default-src 'none'",
    "script-src 'none'",
    "object-src 'none'",
    "frame-src 'none'",
    "connect-src 'none'",
    "form-action 'none'",
    'base-uri http: https:',
    "style-src 'unsafe-inline' http: https: data:",
    'img-src http: https: data: blob:',
    'font-src http: https: data:',
    'media-src http: https: data: blob:',
].join('; ');

export const isHtmlResponse = (response: HtmlResponseData) => {
    if (response.body_encoding === 'base64') return false;
    const headerType = Object.entries(response.headers ?? {}).find(([key]) => key.toLowerCase() === 'content-type')?.[1];
    const type = (response.content_type || headerType || '').split(';', 1)[0].trim().toLowerCase();
    return type === 'text/html' || type === 'application/xhtml+xml';
};

const escapeAttribute = (value: string) => value.replace(/[&"<>]/g, (char) => ({
    '&': '&amp;',
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;',
}[char] ?? char));

export const buildPreviewDocument = (html: string, responseUrl?: string) => {
    let baseTag = '';
    if (responseUrl) {
        try {
            const url = new URL(responseUrl);
            if (url.protocol === 'http:' || url.protocol === 'https:') {
                baseTag = `<base href="${escapeAttribute(url.href)}">`;
            }
        } catch {
            // Older responses may not include a usable final URL.
        }
    }

    // Keep untrusted markup out of the app document. Only the sandboxed iframe parses it.
    return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${escapeAttribute(previewPolicy)}">${baseTag}</head><body>${html}</body></html>`;
};
