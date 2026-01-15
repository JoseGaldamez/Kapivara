import { create } from 'zustand';
import { AppSettings } from '../types/settings';

interface SettingsState {
    settings: AppSettings;
    isLoading: boolean;
    setSettings: (settings: Partial<AppSettings>) => void;
    setLoading: (isLoading: boolean) => void;
    updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
    theme: 'auto',
    language: 'es',
    editor_font_size: 14,
    word_wrap: true,
    ssl_verification: true,
    request_timeout: 30000,
    follow_redirects: true,
    telemetry: false
};

export const useSettingsStore = create<SettingsState>((set) => ({
    settings: DEFAULT_SETTINGS,
    isLoading: true,

    setSettings: (newSettings) => set(state => ({
        settings: { ...state.settings, ...newSettings },
        isLoading: false
    })),

    setLoading: (isLoading) => set({ isLoading }),

    updateSetting: (key, value) => set(state => ({
        settings: {
            ...state.settings,
            [key]: value
        }
    }))
}));
