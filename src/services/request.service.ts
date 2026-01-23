import DBService from "./db.service";
import { RequestInfo } from "@/types";

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
                 WHERE rp.request_id = r.id) as params
            FROM requests r 
            LEFT JOIN request_body rb ON r.id = rb.request_id 
            WHERE r.project_id = $1
        `;
        return await this.dbService.select<RequestInfo[]>(query, [projectId]);
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
    }
}

export default RequestService;
