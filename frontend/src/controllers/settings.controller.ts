import SettingsService from "@/services/settings.service";
import { useSettingsStore } from "@/stores/settings.store";
import { AppSettings } from "@/types/settings";
import { toast } from "react-toastify";
import { cacheTheme } from "@/utils/theme-preference";

class SettingsController {
    private service: SettingsService | null = null;
    private servicePromise: Promise<SettingsService> | null = null;

    private async getService() {
        if (this.service) return this.service;
        if (!this.servicePromise) {
            this.servicePromise = SettingsService.getInstance()
                .then(s => {
                    this.service = s;
                    return s;
                })
                .catch(e => {
                    this.servicePromise = null;
                    throw e;
                });
        }
        return this.servicePromise;
    }

    public async loadSettings() {
        useSettingsStore.getState().setLoading(true);

        try {
            const service = await this.getService()
            const result = await service.getSettings();

            const loadedSettings: Partial<AppSettings> = {};

            result.forEach(({ key, value }) => {
                switch (key) {
                    case 'theme':
                        if (value === 'auto' || value === 'light' || value === 'dark') loadedSettings.theme = value;
                        break;
                    case 'language':
                        if (value === 'en' || value === 'es') loadedSettings.language = value;
                        break;
                    case 'editor_font_size': {
                        const parsed = Number.parseInt(value, 10);
                        if (Number.isFinite(parsed)) loadedSettings.editor_font_size = parsed;
                        break;
                    }
                    case 'request_timeout': {
                        const parsed = Number.parseInt(value, 10);
                        if (Number.isFinite(parsed)) loadedSettings.request_timeout = parsed;
                        break;
                    }
                    case 'word_wrap':
                    case 'ssl_verification':
                    case 'follow_redirects':
                    case 'telemetry':
                        loadedSettings[key] = value === 'true';
                        break;
                }
            });

            cacheTheme(loadedSettings.theme ?? 'auto');
            useSettingsStore.getState().setSettings(loadedSettings);
        } catch (error) {
            console.error('Failed to load settings:', error);
            const message = error instanceof Error ? error.message : String(error);
            toast.error(`Failed to load settings: ${message}`);
            useSettingsStore.getState().setLoading(false);
        }
    }

    public async updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
        try {
            const service = await this.getService();
            const stringValue = String(value);

            await service.updateSetting(key, stringValue);

            if (key === 'theme') cacheTheme(value as AppSettings['theme']);
            useSettingsStore.getState().updateSetting(key, value);
        } catch (error) {
            console.error(`Failed to update setting ${key}:`, error);
            toast.error(`Failed to update setting: ${key}`);
        }
    }
}

export const settingsController = new SettingsController();
