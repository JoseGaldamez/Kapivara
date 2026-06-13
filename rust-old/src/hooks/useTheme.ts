import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settings.store';
import { AppTheme } from '@/types/settings';

export const useTheme = () => {
    const theme = useSettingsStore(state => state.settings.theme);

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (targetTheme: AppTheme) => {
            root.classList.remove('light', 'dark');


            if (targetTheme === 'auto') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
            } else {
                root.classList.add(targetTheme);
            }
        };

        applyTheme(theme);

        // Listener for system changes if auto
        if (theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme('auto');
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }

    }, [theme]);
};
