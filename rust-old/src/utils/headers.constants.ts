export const COMMON_HEADER_KEYS = [
    'Accept',
    'Accept-Encoding',
    'Accept-Language',
    'Authorization',
    'Cache-Control',
    'Connection',
    'Content-Type',
    'User-Agent',
    'X-API-Key',
    'X-Requested-With'
];

const COMMON_HEADER_VALUES_BY_KEY: Record<string, string[]> = {
    accept: ['application/json', '*/*', 'text/plain', 'text/html'],
    'accept-encoding': ['gzip, deflate, br', 'gzip, deflate'],
    'accept-language': ['en-US,en;q=0.9', 'es-ES,es;q=0.9'],
    authorization: ['Bearer {{token}}', 'Basic {{base64_credentials}}'],
    'cache-control': ['no-cache', 'no-store', 'max-age=0'],
    connection: ['keep-alive', 'close'],
    'content-type': [
        'application/json',
        'application/x-www-form-urlencoded',
        'multipart/form-data',
        'text/plain'
    ],
    'user-agent': ['Kapivara/1.0'],
    'x-api-key': ['{{api_key}}'],
    'x-requested-with': ['XMLHttpRequest']
};

export const getCommonHeaderValues = (key: string): string[] => {
    if (!key) return [];
    return COMMON_HEADER_VALUES_BY_KEY[key.trim().toLowerCase()] || [];
};

