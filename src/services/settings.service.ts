import DBService from "./db.service";
import { SettingItem } from "@/types/settings";

class SettingsService {
    private static instance: SettingsService;
    private dbService: DBService | null = null;

    private constructor() { }

    public static async getInstance(): Promise<SettingsService> {
        if (!SettingsService.instance) {
            SettingsService.instance = new SettingsService();
            SettingsService.instance.dbService = await DBService.getInstance();
        }
        return SettingsService.instance;
    }

    public async getSettings(): Promise<SettingItem[]> {
        if (!this.dbService) this.dbService = await DBService.getInstance();
        return await this.dbService.select<SettingItem[]>('SELECT * FROM settings');
    }

    public async updateSetting(key: string, value: string): Promise<void> {
        if (!this.dbService) this.dbService = await DBService.getInstance();
        await this.dbService.execute(
            'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP',
            [key, value]
        );
    }
}

export default SettingsService;
