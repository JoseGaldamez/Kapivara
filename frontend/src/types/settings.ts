export type AppTheme = 'auto' | 'light' | 'dark';
export type AppLanguage = 'en' | 'es';

export interface AppSettings {
    theme: AppTheme;
    language: AppLanguage;
    editor_font_size: number;
    word_wrap: boolean;
    ssl_verification: boolean;
    request_timeout: number;
    follow_redirects: boolean;
    telemetry: boolean;
}

export interface SettingItem {
    key: keyof AppSettings;
    value: string;
    description?: string;
}
