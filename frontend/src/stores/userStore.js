import { create } from 'zustand';
import { http } from '../api/httpClient';
import { useSettingsStore } from './settingsStore';
import { syncThemeWithBackend } from '../theme/themeSync.utils.js';
import { useAuthStore } from './authStore';
import { use } from 'react';

export const useUserStore = create((set, get) => ({
    // State
    userProfile: null,
    sessions: [],
    currentSessionId: null,
    phoneNumber: null,
    isPhoneVerified: false,
    isLoading: false,
    error: null,
    isUpdating: false,




    // Profile Actions
    getUserProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await http.get('/users/me');
            const { data } = response.data;
            console.log('Fetched user profile:', data);// debug log

            set({
                userProfile: data,
                phoneNumber: data.phone?.number || null,
                isPhoneVerified: data.phone?.isVerified || false,
                // sessions: data.sessions || [], // no need here, alreay have getUserSessions
                isLoading: false,
                error: null
            });

            // Sync theme with backend (if settings exist)
            if (data.settings?.theme) {
                const userTheme = data.settings.theme;
                const wasUpdated = syncThemeWithBackend(userTheme.name, userTheme.mode);

                if (wasUpdated) {
                    console.log(`Theme synced with backend: ${userTheme.name} (${userTheme.mode})`);
                    // Refresh settings store to get updated theme info
                    const settingsStore = useSettingsStore.getState();
                    await settingsStore.fetchSettings();
                }
            }
            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch user profile';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    updateUserProfile: async (userData) => {
        set({ isUpdating: true, error: null });
        try {
            const response = await http.patch('/users/me', userData);
            const { data } = response.data;

            set({
                userProfile: {
                    ...get().userProfile,
                    ...data
                },
                isUpdating: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update user profile';
            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    updateUserAvatar: async (avatarFile) => {
        set({ isUpdating: true, error: null });
        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);

            const response = await http.patch('/users/me/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const { data } = response.data;

            set({
                userProfile: {
                    ...get().userProfile,
                    avatar: data.avatar,
                    name: data.name,
                    email: data.email
                },
                isUpdating: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update avatar';
            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    deleteUserAvatar: async () => {
        set({ isUpdating: true, error: null });
        try {
            const response = await http.delete('/users/me/avatar');
            const { data } = response.data;

            set({
                userProfile: {
                    ...get().userProfile,
                    avatar: null
                },
                isUpdating: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete avatar';
            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },




    deleteUserAccount: async () => {
        set({ isUpdating: true, error: null });

        try {
            const response = await http.delete('/users/me/account');
            const { data } = response.data;

            get().resetUserStore();

            useAuthStore.setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });

            localStorage.removeItem('auth-storage');

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to delete account';
            set({
                isUpdating: false,
                error: errorMessage
            });
            throw error;
        }
    },







    // Session Actions
    getUserSessions: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await http.get('/users/sessions');
            const { data } = response.data;

            set({
                sessions: data.sessions || [],
                currentSessionId: data.currentSessionId || null,
                userProfile: {
                    ...get().userProfile,
                    name: data.name,
                    email: data.email
                },
                isLoading: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch sessions';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    logoutSessionById: async (sessionId) => {
        set({ isUpdating: true, error: null });

        try {
            await http.post(`/users/sessions/logout/${sessionId}`);

            await get().getUserSessions();

            set({
                isUpdating: false,
                error: null
            });
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to logout session';

            set({
                isUpdating: false,
                error: errorMessage
            });

            throw error;
        }
    },


    logoutAllSessions: async () => {
        set({ isUpdating: true, error: null });

        try {
            await http.post('/users/sessions/logout');

            await get().getUserSessions();

            set({
                isUpdating: false,
                error: null
            });

        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to logout all sessions';

            set({
                isUpdating: false,
                error: errorMessage
            });

            throw error;
        }
    },




    // Phone Actions
    addPhoneNumber: async (phone) => {
        set({ isUpdating: true, error: null });
        try {
            const response = await http.post('/users/phone', { phone });
            const { data } = response.data;

            set({
                phoneNumber: data.pendingNumber,
                isPhoneVerified: false,
                isUpdating: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add phone number';
            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    verifyPhoneOtp: async (otp) => {
        set({ isUpdating: true, error: null });
        try {
            const response = await http.post('/users/phone/verify', { otp });
            const { data } = response.data;

            set({
                phoneNumber: data.phoneNumber,
                isPhoneVerified: data.isVerified,
                userProfile: {
                    ...get().userProfile,
                    phone: {
                        number: data.phoneNumber,
                        isVerified: data.isVerified
                    }
                },
                isUpdating: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to verify OTP';
            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    unlinkPhoneNumber: async () => {
        set({ isUpdating: true, error: null });
        try {
            const response = await http.delete('/users/phone');
            const { data } = response.data;

            set({
                phoneNumber: null,
                isPhoneVerified: false,
                userProfile: {
                    ...get().userProfile,
                    phone: null
                },
                isUpdating: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to unlink phone number';
            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },







    clearError: () => set({ error: null }),

    resetUserStore: () => set({
        userProfile: null,
        sessions: [],
        phoneNumber: null,
        isPhoneVerified: false,
        isLoading: false,
        error: null,
        isUpdating: false
    }),
}));