import { create } from 'zustand';
import { http } from '../api/httpClient';

export const usePasswordStore = create((set, get) => ({
    // State
    isLoading: false,
    error: null,
    isSuccess: false,
    successMessage: null,

    // Actions
    changePassword: async (currentPassword, newPassword, confirmNewPassword) => {
        set({ isLoading: true, error: null, isSuccess: false, successMessage: null });
        try {
            const response = await http.post('/users/password/change', {
                currentPassword,
                newPassword,
                confirmNewPassword
            });
            const { data, message } = response.data;

            set({
                isLoading: false,
                isSuccess: true,
                successMessage: message || data.message,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to change password';
            set({
                isLoading: false,
                error: errorMessage,
                isSuccess: false,
                successMessage: null
            });
            throw error;
        }
    },

    setupPassword: async (newPassword, confirmNewPassword) => {
        set({ isLoading: true, error: null, isSuccess: false, successMessage: null });
        try {
            const response = await http.post('/users/password/setup', {
                newPassword,
                confirmNewPassword
            });
            const { data, message } = response.data;
            set({
                isLoading: false,
                isSuccess: true,
                successMessage: message || data.message,
                error: null
            });
            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to set up password';
            set({
                isLoading: false,
                error: errorMessage,
                isSuccess: false,
                successMessage: null
            });
            throw error;
        }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true, error: null, isSuccess: false, successMessage: null });
        try {
            const response = await http.post('/users/password/forgot', {
                email
            });
            const { data, message } = response.data;

            set({
                isLoading: false,
                isSuccess: true,
                successMessage: message || 'Password reset link sent to your email',
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send reset link';
            set({
                isLoading: false,
                error: errorMessage,
                isSuccess: false,
                successMessage: null
            });
            throw error;
        }
    },

    resetPassword: async (token, newPassword, confirmNewPassword) => {
        set({ isLoading: true, error: null, isSuccess: false, successMessage: null });
        try {
            const response = await http.post('/users/password/reset', {
                token,
                newPassword,
                confirmNewPassword
            });
            const { data, message } = response.data;

            set({
                isLoading: false,
                isSuccess: true,
                successMessage: message || 'Password reset successfully',
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to reset password';
            set({
                isLoading: false,
                error: errorMessage,
                isSuccess: false,
                successMessage: null
            });
            throw error;
        }
    },

    clearState: () => set({
        isLoading: false,
        error: null,
        isSuccess: false,
        successMessage: null
    }),
}));