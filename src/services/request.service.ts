import DBService from "./db.service";
import { RequestInfo, Collection } from "@/types";

class RequestService {
    private static instance: RequestService;
    private dbService: DBService | null = null;

    private constructor() { }

    public static async getInstance(): Promise<RequestService> {
        if (!RequestService.instance) {
            RequestService.instance = new RequestService();
            RequestService.instance.dbService = await DBService.getInstance();
        }
        return RequestService.instance;
    }

    public async getRequests(projectId: string): Promise<RequestInfo[]> {
        if (!this.dbService) this.dbService = await DBService.getInstance();
        const query = `
            SELECT 
                r.*, 
                rb.body_type, 
                rb.raw_data as body,
                (SELECT json_group_array(json_object('id', rp.id, 'key', rp.key, 'value', rp.value, 'description', rp.description, 'is_active', rp.is_active)) 
                 FROM request_params rp 
                 WHERE rp.request_id = r.id) as params,
                (SELECT json_group_array(json_object('id', rh.id, 'key', rh.key, 'value', rh.value, 'is_active', rh.is_active)) 
                 FROM request_headers rh 
                 WHERE rh.request_id = r.id) as headers,
                (SELECT json_object('id', ra.id, 'auth_type', ra.auth_type, 'auth_data', ra.auth_data)
                 FROM request_auth ra
                 WHERE ra.request_id = r.id) as auth
            FROM requests r 
            LEFT JOIN request_body rb ON r.id = rb.request_id 
            WHERE r.project_id = $1
        `;
        const results = await this.dbService.select<any[]>(query, [projectId]);

        // Parse the SQLite TEXT into JSON Object
        return results.map(row => {
            if (row.response && typeof row.response === 'string') {
                try {
                    row.response = JSON.parse(row.response);
                } catch (e) {
                    row.response = null;
                }
            }
            return row as RequestInfo;
        });
    }

    public async getCollections(projectId: string): Promise<Collection[]> {
        if (!this.dbService) this.dbService = await DBService.getInstance();
        const query = `
            SELECT * FROM collections WHERE project_id = $1 ORDER BY created_at ASC
        `;
        return await this.dbService.select<Collection[]>(query, [projectId]);
    }

    public async createCollection(collection: Collection): Promise<void> {
        if (!this.dbService) this.dbService = await DBService.getInstance();
        const query = `
            INSERT INTO collections (id, project_id, parent_id, name)
            VALUES ($1, $2, $3, $4)
        `;
        await this.dbService.execute(query, [
            collection.id,
            collection.project_id,
            collection.parent_id || null,
            collection.name
        ]);
    }

    public async createRequest(request: RequestInfo): Promise<void> {
        if (!this.dbService) this.dbService = await DBService.getInstance();
        const query = `
      INSERT INTO requests (id, collection_id, project_id, name, method, url)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
        await this.dbService.execute(query, [
            request.id,
            request.collection_id,
            request.project_id,
            request.name,
            request.method,
            request.url
        ]);

        const bodyQuery = `
            INSERT INTO request_body (id, request_id, body_type, raw_data)
            VALUES ($1, $2, $3, $4)
        `;
        await this.dbService.execute(bodyQuery, [
            crypto.randomUUID(),
            request.id,
            request.body_type || 'none',
            request.body || null
        ]);

        const authQuery = `
            INSERT INTO request_auth (id, request_id, auth_type, auth_data)
            VALUES ($1, $2, $3, $4)
        `;
        await this.dbService.execute(authQuery, [
            crypto.randomUUID(),
            request.id,
            'none',
            null
        ]);
    }

    public async updateRequest(request: Partial<RequestInfo> & { id: string }): Promise<void> {
        if (!this.dbService) this.dbService = await DBService.getInstance();

        // Build dynamic update query
        const fields: string[] = [];
        const values: any[] = [];
        let index = 1;

        if (request.name !== undefined) {
            fields.push(`name = $${index++}`);
            values.push(request.name);
        }
        if (request.method !== undefined) {
            fields.push(`method = $${index++}`);
            values.push(request.method);
        }
        if (request.url !== undefined) {
            fields.push(`url = $${index++}`);
            values.push(request.url);
        }
        if (request.collection_id !== undefined) {
            fields.push(`collection_id = $${index++}`);
            values.push(request.collection_id);
        }
        if (request.response !== undefined) {
            fields.push(`response = $${index++}`);
            values.push(request.response ? JSON.stringify(request.response) : null);
        }
        // Update requests table if needed
        if (fields.length > 0) {
            values.push(request.id);
            const query = `UPDATE requests SET ${fields.join(', ')} WHERE id = $${index}`;
            await this.dbService.execute(query, values);
        }

        // Handle Body updates
        if (request.body !== undefined || request.body_type !== undefined) {
            // Check if exists
            const existing = await this.dbService.select<any[]>('SELECT id FROM request_body WHERE request_id = $1', [request.id]);

            if (existing && existing.length > 0) {
                // Update
                const bodyFields: string[] = [];
                const bodyValues: any[] = [];
                let bodyIndex = 1;

                if (request.body !== undefined) {
                    bodyFields.push(`raw_data = $${bodyIndex++}`);
                    bodyValues.push(request.body);
                }
                if (request.body_type !== undefined) {
                    bodyFields.push(`body_type = $${bodyIndex++}`);
                    bodyValues.push(request.body_type);
                }

                bodyValues.push(request.id);
                const bodyQuery = `UPDATE request_body SET ${bodyFields.join(', ')} WHERE request_id = $${bodyIndex}`;
                await this.dbService.execute(bodyQuery, bodyValues);
            } else {
                // Insert
                const insertQuery = `
                    INSERT INTO request_body (id, request_id, body_type, raw_data)
                    VALUES ($1, $2, $3, $4)
                `;
                await this.dbService.execute(insertQuery, [
                    crypto.randomUUID(),
                    request.id,
                    request.body_type || 'none',
                    request.body || null
                ]);
            }
        }


        // Handle Params updates
        if (request.params !== undefined) {

            let paramsArray: any[] = [];
            try {
                paramsArray = typeof request.params === 'string' ? JSON.parse(request.params) : request.params;
            } catch (e) {
                paramsArray = [];
            }

            if (Array.isArray(paramsArray)) {
                await this.dbService.execute('DELETE FROM request_params WHERE request_id = $1', [request.id]);

                for (const param of paramsArray) {
                    if (!param.key && !param.value) continue; // Skip empty

                    await this.dbService.execute(`
                        INSERT INTO request_params (id, request_id, key, value, description, is_active)
                        VALUES ($1, $2, $3, $4, $5, $6)
                    `, [
                        param.id || crypto.randomUUID(),
                        request.id,
                        param.key,
                        param.value,
                        param.description || '',
                        param.is_active
                    ]);
                }
            }
        }

        // Handle Headers updates
        if (request.headers !== undefined) {
            let headersArray: any[] = [];
            try {
                headersArray = typeof request.headers === 'string' ? JSON.parse(request.headers) : request.headers;
            } catch (e) {
                headersArray = [];
            }

            if (Array.isArray(headersArray)) {
                await this.dbService.execute('DELETE FROM request_headers WHERE request_id = $1', [request.id]);

                for (const header of headersArray) {
                    if (!header.key && !header.value) continue; // Skip empty

                    await this.dbService.execute(`
                        INSERT INTO request_headers (id, request_id, key, value, is_active)
                        VALUES ($1, $2, $3, $4, $5)
                    `, [
                        header.id || crypto.randomUUID(),
                        request.id,
                        header.key,
                        header.value,
                        header.is_active
                    ]);
                }
            }
        }

        // Handle Auth updates
        if (request.auth !== undefined) {
            let authObj: any = null;
            try {
                authObj = typeof request.auth === 'string' ? JSON.parse(request.auth) : request.auth;
            } catch (e) {
                authObj = null;
            }

            if (authObj) {
                const existingAuth = await this.dbService.select<any[]>('SELECT id FROM request_auth WHERE request_id = $1', [request.id]);
                if (existingAuth && existingAuth.length > 0) {
                    const updateAuthQuery = `UPDATE request_auth SET auth_type = $1, auth_data = $2 WHERE request_id = $3`;
                    await this.dbService.execute(updateAuthQuery, [
                        authObj.auth_type || 'none',
                        authObj.auth_data || null,
                        request.id
                    ]);
                } else {
                    const insertAuthQuery = `INSERT INTO request_auth (id, request_id, auth_type, auth_data) VALUES ($1, $2, $3, $4)`;
                    await this.dbService.execute(insertAuthQuery, [
                        crypto.randomUUID(),
                        request.id,
                        authObj.auth_type || 'none',
                        authObj.auth_data || null
                    ]);
                }
            }
        }
    }
}

export default RequestService;
