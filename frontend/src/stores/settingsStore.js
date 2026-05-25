import { create } from 'zustand';
import { http } from '../api/httpClient';
import { THEME_IDS, THEME_MODES } from '../theme/theme.constant.js';
import { applyUserTheme } from '../theme/theme.utils.js';
import { saveThemeToLocalStorage } from '../theme/themeSync.utils.js';
import { AppToast } from '@/config/toast.config.jsx';

export const useSettingsStore = create((set, get) => ({
    theme: {
        name: THEME_IDS.DEFAULT,
        mode: THEME_MODES.DARK,
        tier: 'free'
    },
    timezone: 'Asia/Kolkata',
    notifications: {
        email: false,
        inApp: true
    },
    isLoading: false,
    error: null,
    isUpdating: false,

    fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await http.get('/users/me');
            const { data } = response.data;
            const settings = data.settings || {};
            const themeData = {
                name: settings.theme?.name || THEME_IDS.DEFAULT,
                mode: settings.theme?.mode || THEME_MODES.DARK,
                tier: settings.theme?.tier || 'free'
            };

            set({
                theme: themeData,
                timezone: settings.timezone || 'Asia/Kolkata',
                notifications: settings.notifications || {
                    email: false,
                    inApp: true
                },
                isLoading: false,
                error: null
            });

            return data.settings;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch settings';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    updateTheme: async (themeName, themeMode) => {
        set({ isUpdating: true, error: null });
        try {
            const response = await http.patch('/users/settings/theme', {
                theme: { name: themeName, mode: themeMode }
            });
            const { data } = response.data;

            const newTheme = {
                name: data.theme.name,
                mode: data.theme.mode,
                tier: get().theme.tier
            };

            set({
                theme: newTheme,
                isUpdating: false,
                error: null
            });

            applyUserTheme(newTheme.name, newTheme.mode);
            saveThemeToLocalStorage(newTheme.name, newTheme.mode);

            AppToast.success(data.message || 'Theme updated successfully!', {
                icon: 'platte',
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update theme';
            set({ isUpdating: false, error: errorMessage });
            AppToast.error(errorMessage || 'Failed to update theme');
            throw error;
        }
    },

    updateTimezone: async (timezone) => {
        set({ isUpdating: true, error: null });
        try {
            const response = await http.patch('/users/settings/timezone', { timezone });
            const { data } = response.data;

            set({
                timezone: data.timezone,
                isUpdating: false,
                error: null
            });

            AppToast.success(data.message || 'Timezone updated successfully!');

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update timezone';
            set({ isUpdating: false, error: errorMessage });
            AppToast.error(errorMessage || 'Failed to update timezone');

            throw error;
        }
    },

    updateNotifications: async (notifications) => {
        set({ isUpdating: true, error: null });
        try {
            const response = await http.patch('/users/settings/notifications', { notifications });
            const { data } = response.data;

            set({
                notifications: data.notifications,
                isUpdating: false,
                error: null
            });

            AppToast.success(data.message || 'Notification settings updated successfully!');

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update notifications';
            set({ isUpdating: false, error: errorMessage });
            AppToast.error(errorMessage || 'Failed to update notifications');

            throw error;
        }
    },

    // Helper method to check if user has pro tier
    isProTier: () => {
        return get().theme.tier === 'pro';
    },

    // Helper method to get available themes (based on tier)
    getAvailableThemes: () => {
        const allThemes = Object.values(THEME_IDS).map(themeId => ({
            value: themeId,
            label: themeId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        }));

        const currentTier = get().theme.tier;
        if (currentTier === 'free') {
            // Free tier only gets default theme
            return allThemes.filter(theme => theme.value === THEME_IDS.DEFAULT);
        }

        // Pro tier gets all themes
        return allThemes;
    },

    clearError: () => set({ error: null }),

    resetSettings: () => set({
        theme: {
            name: THEME_IDS.DEFAULT,
            mode: THEME_MODES.DARK,
            tier: 'free'
        },
        timezone: 'Asia/Kolkata',
        notifications: {
            email: false,
            inApp: true
        },
        isLoading: false,
        error: null,
        isUpdating: false
    }),
}));
