import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/stores/settings.store';
import { AppTheme } from '@/types/settings';

export type ResolvedTheme = 'light' | 'dark';

export const getResolvedTheme = (theme: AppTheme): ResolvedTheme => {
    if (theme !== 'auto') return theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyThemeToDocument = (theme: AppTheme): ResolvedTheme => {
    const resolved = getResolvedTheme(theme);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.classList.toggle('light', resolved === 'light');
    return resolved;
};

export const useTheme = () => {
    const theme = useSettingsStore(state => state.settings.theme);
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => getResolvedTheme(theme));

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const applyTheme = () => {
            setResolvedTheme(applyThemeToDocument(theme));
        };

        applyTheme();

        if (theme === 'auto') {
            mediaQuery.addEventListener('change', applyTheme);
            return () => mediaQuery.removeEventListener('change', applyTheme);
        }
    }, [theme]);

    return resolvedTheme;
};
