import Database from '@tauri-apps/plugin-sql';

class DBService {
    private static initPromise: Promise<DBService> | null = null;
    private db: Database | null = null;
    private readonly dbName = 'sqlite:kapivara.db';

    private constructor() { }

    public static async getInstance(): Promise<DBService> {
        if (!DBService.initPromise) {
            const inst = new DBService();
            DBService.initPromise = inst.init()
                .then(() => inst)
                .catch((e) => {
                    console.error('Failed to initialize database:', e);
                    DBService.initPromise = null;
                    throw e;
                });
        }
        return DBService.initPromise;
    }

    private async init() {
        try {
            this.db = await Database.load(this.dbName);
        } catch (error) {
            console.error('Error loading database:', error);
            throw error;
        }
    }

    public async select<T>(query: string, args?: unknown[]): Promise<T> {
        const service = await DBService.getInstance();
        if (!service.db) {
            throw new Error('Database not initialized');
        }
        try {
            return await service.db.select<T>(query, args);
        } catch (error) {
            console.error('Database select error:', error, 'Query:', query);
            throw error;
        }
    }

    public async execute(query: string, args?: unknown[]): Promise<void> {
        const service = await DBService.getInstance();
        if (!service.db) {
            throw new Error('Database not initialized');
        }
        try {
            await service.db.execute(query, args);
        } catch (error) {
            console.error('Database execute error:', error, 'Query:', query);
            throw error;
        }
    }
}

export default DBService;
