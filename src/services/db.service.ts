import Database from '@tauri-apps/plugin-sql';

class DBService {
    private static initPromise: Promise<DBService> | null = null;
    private db: Database | null = null;
    private readonly dbName = 'sqlite:kapivara.db';

    private constructor() { }

    public static getInstance(): Promise<DBService> {
        if (!DBService.initPromise) {
            const inst = new DBService();
            DBService.initPromise = inst.init()
                .then(() => inst)
                .catch((e) => {
                    DBService.initPromise = null;
                    throw e;
                });
        }
        return DBService.initPromise;
    }

    private async init() {
        this.db = await Database.load(this.dbName);
    }

    public async select<T>(query: string, args?: unknown[]): Promise<T> {
        return await this.db!.select<T>(query, args);
    }

    public async execute(query: string, args?: unknown[]): Promise<void> {
        await this.db!.execute(query, args);
    }
}

export default DBService;
