import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/stores/settings.store';
import { AppTheme } from '@/types/settings';

export type ResolvedTheme = 'light' | 'dark';

const getResolvedTheme = (theme: AppTheme): ResolvedTheme => {
    if (theme !== 'auto') return theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useTheme = () => {
    const theme = useSettingsStore(state => state.settings.theme);
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => getResolvedTheme(theme));

    useEffect(() => {
        const root = window.document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const applyTheme = () => {
            const nextTheme = theme === 'auto'
                ? (mediaQuery.matches ? 'dark' : 'light')
                : theme;
            root.classList.remove('light', 'dark');
            root.classList.add(nextTheme);
            setResolvedTheme(nextTheme);
        };

        applyTheme();

        if (theme === 'auto') {
            mediaQuery.addEventListener('change', applyTheme);
            return () => mediaQuery.removeEventListener('change', applyTheme);
        }
    }, [theme]);

    return resolvedTheme;
};
