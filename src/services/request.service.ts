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
        return await this.dbService.select<RequestInfo[]>('SELECT * FROM requests WHERE project_id = $1', [projectId]);
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
        // TODO: Add other fields as needed
        if (fields.length === 0) return;

        values.push(request.id);
        const query = `UPDATE requests SET ${fields.join(', ')} WHERE id = $${index}`;

        await this.dbService.execute(query, values);
    }
}

export default RequestService;
