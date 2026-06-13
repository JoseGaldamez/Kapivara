import { DBSelect, DBExecute } from '../../wailsjs/go/main/App';

class DBService {
    private static initPromise: Promise<DBService> | null = null;

    private constructor() { }

    public static async getInstance(): Promise<DBService> {
        if (!DBService.initPromise) {
            const inst = new DBService();
            DBService.initPromise = Promise.resolve(inst);
        }
        return DBService.initPromise;
    }

    public async select<T>(query: string, args?: unknown[]): Promise<T> {
        try {
            const result = await DBSelect(query, args ?? []);
            return result as T;
        } catch (error) {
            console.error('Database select error:', error, 'Query:', query);
            throw error;
        }
    }

    public async execute(query: string, args?: unknown[]): Promise<void> {
        try {
            await DBExecute(query, args ?? []);
        } catch (error) {
            console.error('Database execute error:', error, 'Query:', query);
            throw error;
        }
    }
}

export default DBService;
