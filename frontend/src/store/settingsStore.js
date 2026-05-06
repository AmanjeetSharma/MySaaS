import { create } from 'zustand';
import { http } from '../api/httpClient';

export const useSettingsStore = create((set, get) => ({
    // State - Matching backend defaults
    theme: {
        name: 'default',  // Changed from 'light' to 'default'
        mode: 'dark',     // Changed from 'light' to 'dark' (matches backend)
        tier: 'free'      // Added tier field
    },
    timezone: 'Asia/Kolkata',  // Changed to match backend default
    notifications: {
        email: false,    // Changed from true to false (matches backend)
        inApp: true      // Keep as true (matches backend)
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

            set({
                theme: data.settings?.theme || {
                    name: 'default',
                    mode: 'dark',
                    tier: 'free'
                },
                timezone: data.settings?.timezone || 'Asia/Kolkata',
                notifications: data.settings?.notifications || {
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

            set({
                theme: {
                    ...get().theme,
                    name: data.theme.name,
                    mode: data.theme.mode
                },
                isUpdating: false,
                error: null
            });

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
            { value: 'default', label: 'Default' },
            { value: 'slate-orange', label: 'Slate Orange' },
            { value: 'midnight-violet', label: 'Midnight Violet' },
            { value: 'forest-amber', label: 'Forest Amber' },
            { value: 'rose-quartz', label: 'Rose Quartz' }
        ];

        const currentTier = get().theme.tier;
        if (currentTier === 'free') {
            // Free tier only gets default theme
            return allThemes.filter(theme => theme.value === 'default');
        }

        // Pro tier gets all themes
        return allThemes;
    },

    clearError: () => set({ error: null }),

    resetSettings: () => set({
        theme: {
            name: 'default',
            mode: 'dark',
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