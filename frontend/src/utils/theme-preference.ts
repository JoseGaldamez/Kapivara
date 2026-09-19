import type { AppTheme } from '@/types/settings';

const STORAGE_KEY = 'kapivara.theme';

export const readCachedTheme = (): AppTheme => {
    try {
        const theme = window.localStorage.getItem(STORAGE_KEY);
        return theme === 'dark' || theme === 'light' ? theme : 'auto';
    } catch {
        return 'auto';
    }
};

export const cacheTheme = (theme: AppTheme): void => {
    try {
        window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
        // A disabled storage API should not prevent the app from opening.
    }
};
