import type { RequestInfo } from "@/types";

export interface ParsedCurlRequest {
    method: string;
    url: string;
    headers: Array<{ key: string; value: string }>;
    params: Array<{ key: string; value: string }>;
    body: string;
    bodyType: NonNullable<RequestInfo["body_type"]>;
    auth: {
        auth_type: "none" | "bearer" | "basic";
        auth_data: Record<string, string>;
    };
    warnings: string[];
}

export class CurlParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CurlParseError";
    }
}

const FLAGS_WITHOUT_VALUE = new Set([
    "--location", "-L", "--compressed", "--silent", "-s", "--show-error", "-S",
    "--insecure", "-k", "--fail", "-f", "--globoff", "-g", "--include", "-i",
    "--verbose", "-v",
]);

const OPTIONS_WITH_VALUE = new Set([
    "--connect-timeout", "--max-time", "-m", "--retry", "--retry-delay", "--proxy", "-x",
    "--proxy-user", "-U", "--cert", "-E", "--key", "--cacert", "--capath", "--output", "-o",
    "--resolve", "--interface", "--limit-rate",
]);

function tokenize(command: string): string[] {
    const normalized = command
        .replace(/\\\r?\n/g, " ")
        .replace(/\^\r?\n/g, " ")
        .replace(/`\r?\n/g, " ")
        .trim();
    if (!normalized) throw new CurlParseError("Paste a cURL command to import.");

    const tokens: string[] = [];
    let current = "";
    let quote: "'" | '"' | null = null;

    for (let index = 0; index < normalized.length; index += 1) {
        const char = normalized[index];
        if (quote) {
            if (char === quote) {
                quote = null;
            } else if (char === "\\" && quote === '"' && index + 1 < normalized.length) {
                const next = normalized[index + 1];
                current += next === "n" ? "\n" : next === "r" ? "\r" : next === "t" ? "\t" : next;
                index += 1;
            } else {
                current += char;
            }
            continue;
        }

        if (char === "'" || char === '"') {
            quote = char;
        } else if (/\s/.test(char)) {
            if (current) {
                tokens.push(current);
                current = "";
            }
        } else if (char === "\\" && index + 1 < normalized.length) {
            current += normalized[index + 1];
            index += 1;
        } else {
            current += char;
        }
    }

    if (quote) throw new CurlParseError("The cURL command contains an unclosed quote.");
    if (current) tokens.push(current);
    return tokens;
}

function unwrapMarkdownLink(value: string): string {
    const match = value.match(/^\[(https?:\/\/[^\]]+)]\((https?:\/\/[^)]+)\)$/i);
    return match ? match[2] : value;
}

function splitHeader(value: string): { key: string; value: string } | null {
    const separator = value.indexOf(":");
    if (separator <= 0) return null;
    return { key: value.slice(0, separator).trim(), value: value.slice(separator + 1).trimStart() };
}

function decodeBasicCredentials(encoded: string): { username: string; password: string } | null {
    try {
        const decoded = atob(encoded.trim());
        const separator = decoded.indexOf(":");
        if (separator < 0) return null;
        return { username: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
    } catch {
        return null;
    }
}

function pairsFromEncoded(value: string): Array<{ key: string; value: string }> {
    return Array.from(new URLSearchParams(value).entries()).map(([key, itemValue]) => ({ key, value: itemValue }));
}

function splitUrl(value: string): { url: string; params: Array<{ key: string; value: string }> } {
    const unwrapped = unwrapMarkdownLink(value);
    try {
        const parsed = new URL(unwrapped);
        const params = Array.from(parsed.searchParams.entries()).map(([key, itemValue]) => ({ key, value: itemValue }));
        parsed.search = "";
        parsed.hash = "";
        return { url: parsed.toString(), params };
    } catch {
        const hashless = unwrapped.split("#", 1)[0];
        const separator = hashless.indexOf("?");
        if (separator < 0) return { url: hashless, params: [] };
        return { url: hashless.slice(0, separator), params: pairsFromEncoded(hashless.slice(separator + 1)) };
    }
}

export function parseCurlCommand(command: string): ParsedCurlRequest {
    const tokens = tokenize(command);
    if (tokens[0] === "$") tokens.shift();
    if (!/^curl(?:\.exe)?$/i.test(tokens.shift() ?? "")) {
        throw new CurlParseError("The text must begin with curl.");
    }

    let explicitMethod = "";
    let rawUrl = "";
    let useGet = false;
    let useHead = false;
    let basicCredentials: string | null = null;
    let bearerToken: string | null = null;
    const headers: Array<{ key: string; value: string }> = [];
    const dataParts: string[] = [];
    const encodedParts: string[] = [];
    const formParts: string[] = [];
    const warnings: string[] = [];
    let jsonPayload: string | null = null;

    const takeValue = (index: number, option: string): [string, number] => {
        const value = tokens[index + 1];
        if (value === undefined) {
            throw new CurlParseError(`${option} requires a value.`);
        }
        return [value, index + 1];
    };

    for (let index = 0; index < tokens.length; index += 1) {
        let token = tokens[index].replace(/^\\(?=--)/, "");
        let attachedValue: string | null = null;
        if (token.startsWith("--") && token.includes("=")) {
            const separator = token.indexOf("=");
            attachedValue = token.slice(separator + 1);
            token = token.slice(0, separator);
        }
        const valueFor = (option: string): string => {
            if (attachedValue !== null) return attachedValue;
            const [value, consumedIndex] = takeValue(index, option);
            index = consumedIndex;
            return value;
        };

        if (FLAGS_WITHOUT_VALUE.has(token)) continue;
        if (token === "-G" || token === "--get") { useGet = true; continue; }
        if (token === "-I" || token === "--head") { useHead = true; continue; }
        if (token === "-X" || token === "--request") { explicitMethod = valueFor(token).toUpperCase(); continue; }
        if (/^-X.+/.test(token)) { explicitMethod = token.slice(2).toUpperCase(); continue; }
        if (token === "--url") { rawUrl = valueFor(token); continue; }
        if (token === "-H" || token === "--header") {
            const parsed = splitHeader(valueFor(token));
            if (parsed) headers.push(parsed);
            else warnings.push("A header without a colon was ignored.");
            continue;
        }
        if (/^-H.+/.test(token)) {
            const parsed = splitHeader(token.slice(2));
            if (parsed) headers.push(parsed);
            continue;
        }
        if (["-d", "--data", "--data-raw", "--data-binary", "--data-ascii"].includes(token)) {
            const value = valueFor(token);
            dataParts.push(value);
            if (token === "--data-binary" && value.startsWith("@")) warnings.push("File references are kept as text and are not read during import.");
            continue;
        }
        if (/^-d.+/.test(token)) { dataParts.push(token.slice(2)); continue; }
        if (token === "--data-urlencode") { encodedParts.push(valueFor(token)); continue; }
        if (token === "--json") { jsonPayload = valueFor(token); continue; }
        if (["-F", "--form", "--form-string"].includes(token)) { formParts.push(valueFor(token)); continue; }
        if (/^-F.+/.test(token)) { formParts.push(token.slice(2)); continue; }
        if (token === "-u" || token === "--user") { basicCredentials = valueFor(token); continue; }
        if (token === "--oauth2-bearer") { bearerToken = valueFor(token); continue; }
        if (token === "-b" || token === "--cookie") {
            const cookie = valueFor(token);
            if (cookie.startsWith("@")) warnings.push("Cookie file references are not read during import.");
            else headers.push({ key: "Cookie", value: cookie });
            continue;
        }
        if (token === "-A" || token === "--user-agent") { headers.push({ key: "User-Agent", value: valueFor(token) }); continue; }
        if (token === "-e" || token === "--referer") { headers.push({ key: "Referer", value: valueFor(token) }); continue; }
        if (OPTIONS_WITH_VALUE.has(token)) {
            valueFor(token);
            warnings.push(`${token} is a transport option and was not imported.`);
            continue;
        }
        if (token.startsWith("-")) {
            warnings.push(`${token} is not supported and was ignored.`);
            continue;
        }
        if (!rawUrl) rawUrl = token;
    }

    if (!rawUrl) throw new CurlParseError("No URL was found in the cURL command.");
    const split = splitUrl(rawUrl);
    if (!split.url) throw new CurlParseError("The cURL URL is invalid.");

    let auth: ParsedCurlRequest["auth"] = { auth_type: "none", auth_data: {} };
    const remainingHeaders: typeof headers = [];
    for (const header of headers) {
        if (header.key.toLowerCase() !== "authorization") {
            remainingHeaders.push(header);
            continue;
        }
        const bearer = header.value.match(/^Bearer\s+(.+)$/i);
        const basic = header.value.match(/^Basic\s+(.+)$/i);
        if (bearer) bearerToken = bearer[1].trim();
        else if (basic) {
            const decoded = decodeBasicCredentials(basic[1]);
            if (decoded) auth = { auth_type: "basic", auth_data: decoded };
            else remainingHeaders.push(header);
        } else remainingHeaders.push(header);
    }
    if (basicCredentials !== null) {
        const separator = basicCredentials.indexOf(":");
        auth = {
            auth_type: "basic",
            auth_data: separator < 0
                ? { username: basicCredentials, password: "" }
                : { username: basicCredentials.slice(0, separator), password: basicCredentials.slice(separator + 1) },
        };
    }
    if (bearerToken !== null) auth = { auth_type: "bearer", auth_data: { token: bearerToken } };

    const contentType = remainingHeaders.find((header) => header.key.toLowerCase() === "content-type")?.value.toLowerCase() ?? "";
    let body = "";
    let bodyType: ParsedCurlRequest["bodyType"] = "none";
    const params = [...split.params];
    const combinedData = [...dataParts, ...encodedParts].join("&");

    if (useGet && combinedData) {
        params.push(...pairsFromEncoded(combinedData));
    } else if (jsonPayload !== null) {
        body = jsonPayload;
        bodyType = "json";
        if (!remainingHeaders.some((header) => header.key.toLowerCase() === "content-type")) remainingHeaders.push({ key: "Content-Type", value: "application/json" });
        if (!remainingHeaders.some((header) => header.key.toLowerCase() === "accept")) remainingHeaders.push({ key: "Accept", value: "application/json" });
    } else if (formParts.length > 0) {
        bodyType = "form-data";
        body = JSON.stringify(formParts.map((part) => {
            const separator = part.indexOf("=");
            const key = separator < 0 ? part : part.slice(0, separator);
            const rawValue = separator < 0 ? "" : part.slice(separator + 1);
            return { key, value: rawValue.startsWith("@") ? rawValue.slice(1) : rawValue, type: rawValue.startsWith("@") ? "file" : "text", is_active: 1 };
        }));
    } else if (combinedData) {
        if (contentType.includes("application/x-www-form-urlencoded") || encodedParts.length > 0) {
            bodyType = "x-www-form-urlencoded";
            body = JSON.stringify(pairsFromEncoded(combinedData).map((pair) => ({ ...pair, is_active: 1 })));
        } else if (contentType.includes("json") || (() => { try { JSON.parse(combinedData); return true; } catch { return false; } })()) {
            bodyType = "json";
            body = combinedData;
        } else {
            bodyType = "raw";
            body = combinedData;
        }
    }

    const inferredMethod = useHead ? "HEAD" : useGet ? "GET" : bodyType !== "none" ? "POST" : "GET";
    return {
        method: explicitMethod || inferredMethod,
        url: split.url,
        headers: remainingHeaders,
        params,
        body,
        bodyType,
        auth,
        warnings,
    };
}
