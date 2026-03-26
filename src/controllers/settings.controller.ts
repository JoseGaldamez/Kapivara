import SettingsService from "@/services/settings.service";
import { useSettingsStore } from "@/stores/settings.store";
import { AppSettings } from "@/types/settings";
import { toast } from "react-toastify";

class SettingsController {
    private service: SettingsService | null = null;

    private async getService() {
        if (!this.service) {
            try {
                this.service = await SettingsService.getInstance();
            } catch (e) {
                this.service = null;
                throw e;
            }
        }
        return this.service;
    }

    public async loadSettings(retries = 3, delayMs = 500) {
        useSettingsStore.getState().setLoading(true);
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const service = await this.getService();
                const result = await service.getSettings();

                const loadedSettings: Partial<AppSettings> = {};
                result.forEach(item => {
                    const key = item.key as keyof AppSettings;
                    let value: any = item.value;
                    if (key === 'editor_font_size' || key === 'request_timeout') {
                        value = parseInt(value, 10);
                    } else if (value === 'true') {
                        value = true;
                    } else if (value === 'false') {
                        value = false;
                    }
                    loadedSettings[key] = value;
                });

                useSettingsStore.getState().setSettings(loadedSettings);
                return;
            } catch (error) {
                this.service = null;
                if (attempt < retries - 1) {
                    await new Promise(r => setTimeout(r, delayMs));
                } else {
                    console.error('Failed to load settings:', error);
                    toast.error('Failed to load settings');
                    useSettingsStore.getState().setSettings({});
                }
            }
        }
    }

    public async updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
        try {
            const service = await this.getService();
            const stringValue = String(value);

            await service.updateSetting(key, stringValue);

            useSettingsStore.getState().updateSetting(key, value);
        } catch (error) {
            console.error(`Failed to update setting ${key}:`, error);
            toast.error(`Failed to update setting: ${key}`);
        }
    }
}

export const settingsController = new SettingsController();
