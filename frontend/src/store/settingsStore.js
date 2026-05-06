import { create } from 'zustand';
import { http } from '../api/httpClient';
import { THEME_IDS, THEME_MODES } from '../constants/theme.constant';
import { applyUserTheme } from '../utils/theme.utils';
import { saveThemeToLocalStorage, getThemeFromLocalStorage } from '../utils/themeSync.utils';

export const useSettingsStore = create((set, get) => ({
    // State - Matching backend defaults
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

    // Actions
    fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            // Settings are included in user profile response
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
                tier: get().theme.tier // Preserve tier
            };

            set({
                theme: newTheme,
                isUpdating: false,
                error: null
            });

            // Apply theme to DOM immediately
            applyUserTheme(newTheme.name, newTheme.mode);

            // Save to localStorage for persistence
            saveThemeToLocalStorage(newTheme.name, newTheme.mode);

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update theme';
            set({ isUpdating: false, error: errorMessage });
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

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update timezone';
            set({ isUpdating: false, error: errorMessage });
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

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update notifications';
            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    // Helper method to check if user has pro tier
    isProTier: () => {
        return get().theme.tier === 'pro';
    },

    // Helper method to get available themes (based on tier)
    getAvailableThemes: () => {
        const allThemes = [
            { value: THEME_IDS.DEFAULT, label: 'Default' },
            { value: THEME_IDS.SLATE_ORANGE, label: 'Slate Orange' },
            { value: THEME_IDS.MIDNIGHT_VIOLET, label: 'Midnight Violet' },
            { value: THEME_IDS.FOREST_AMBER, label: 'Forest Amber' },
            { value: THEME_IDS.ROSE_QUARTZ, label: 'Rose Quartz' },
            { value: THEME_IDS.GRAPHITE_LIME, label: 'Graphite Lime' }
        ];

        const currentTier = get().theme.tier;
        if (currentTier === 'free') {
            // Free tier only gets default theme
            return allThemes.filter(theme => theme.value === THEME_IDS.DEFAULT);
        }

        // Pro tier gets all themes
        return allThemes;
    },

    // Sync theme with backend (called after getUserProfile)
    syncThemeWithBackend: (backendTheme) => {
        const currentTheme = get().theme;
        const localStorageTheme = getThemeFromLocalStorage();

        const backendThemeData = {
            name: backendTheme?.name || THEME_IDS.DEFAULT,
            mode: backendTheme?.mode || THEME_MODES.DARK,
            tier: backendTheme?.tier || 'free'
        };

        // Priority: Backend > LocalStorage > Default
        const finalTheme = {
            name: backendThemeData.name !== THEME_IDS.DEFAULT
                ? backendThemeData.name
                : localStorageTheme.name,
            mode: backendThemeData.mode !== THEME_MODES.DARK
                ? backendThemeData.mode
                : localStorageTheme.mode,
            tier: backendThemeData.tier
        };

        // Check if theme needs to be updated
        const needsUpdate =
            currentTheme.name !== finalTheme.name ||
            currentTheme.mode !== finalTheme.mode;

        if (needsUpdate) {
            // Update store
            set({ theme: finalTheme });

            // Apply theme to DOM
            applyUserTheme(finalTheme.name, finalTheme.mode);

            // Save to localStorage
            saveThemeToLocalStorage(finalTheme.name, finalTheme.mode);

            console.log(`Theme synced: ${finalTheme.name} (${finalTheme.mode})`);
        }

        return finalTheme;
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