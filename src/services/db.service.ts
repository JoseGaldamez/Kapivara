import Database from '@tauri-apps/plugin-sql';

class DBService {
    private static instance: DBService;
    private db: Database | null = null;
    private dbName = 'sqlite:kapivara.db';

    private constructor() { }

    public static async getInstance(): Promise<DBService> {
        if (!DBService.instance) {
            DBService.instance = new DBService();
            await DBService.instance.init();
        }
        return DBService.instance;
    }

    private async init() {
        this.db = await Database.load(this.dbName);
    }

    public async select<T>(query: string, args?: unknown[]): Promise<T> {
        if (!this.db) await this.init();
        return await this.db!.select<T>(query, args);
    }

    public async execute(query: string, args?: unknown[]): Promise<void> {
        if (!this.db) await this.init();
        await this.db!.execute(query, args);
    }
}

export default DBService;
