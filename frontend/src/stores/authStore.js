import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { http } from '../api/httpClient';
import { useAppStore } from './appStore';
import { toastIcon } from '../constants/toastIcon.constant';
import { toast } from 'sonner';

export const useAuthStore = create(persist(
    (set, get) => ({
        // State
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        register: async (userData) => {
            set({ isLoading: true, error: null });
            try {
                const formData = new FormData();
                formData.append('name', userData.name);
                formData.append('email', userData.email);
                formData.append('password', userData.password);
                if (userData.avatar) {
                    formData.append('avatar', userData.avatar);
                }

                const response = await http.post('/auth/register', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                set({ isLoading: false, error: null });
                return response.data;
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Registration failed';
                set({ isLoading: false, error: errorMessage });
                throw error;
            }
        },

        verifyEmail: async (token) => {
            set({ isLoading: true, error: null });
            try {
                const response = await http.post(`/auth/verify-email/${token}`);
                set({ isLoading: false });
                return response.data;
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Email verification failed';
                set({ isLoading: false, error: errorMessage });
                throw error;
            }
        },

        login: async (credentials) => {
            set({ isLoading: true, error: null });
            try {
                const response = await http.post('/auth/login', credentials);
                const { data } = response.data;

                useAppStore.getState().setAppReady(false);

                set({
                    user: data,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });

                toast.success(data?.message || 'Login successful', {
                    icon: toastIcon('success'),
                });

                return response.data;
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Login failed';
                set({ isLoading: false, error: errorMessage, isAuthenticated: false });
                throw error;
            }
        },

        googleLogin: async (credentials) => {
            set({ isLoading: true, error: null });
            try {
                const response = await http.post('/auth/login/google', credentials);
                const { data } = response.data;

                useAppStore.getState().setAppReady(false);

                set({
                    user: data,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });

                toast.success(data?.message || 'Google login successful', {
                    icon: toastIcon('success'),
                });

                return response.data;
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Google login failed';
                set({ isLoading: false, error: errorMessage, isAuthenticated: false });
                throw error;
            }
        },

        logout: async () => {
            set({ isLoading: true });
            try {
                await http.post('/auth/logout');

                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null
                });
                useAppStore.getState().setAppReady(true);

                // Clear persisted data
                localStorage.removeItem('auth-storage');
            } catch (error) {
                console.error('Logout error:', error);
                // Still clear local state even if API call fails
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null
                });
                useAppStore.getState().setAppReady(true);
                localStorage.removeItem('auth-storage');
            }
        },

        refreshSession: async () => {
            try {
                const response = await http.post('/auth/refresh');
                const { data } = response.data;

                set({
                    user: data,
                    isAuthenticated: true,
                });

                return response.data;
            } catch (error) {
                // If refresh fails, logout
                get().logout();
                throw error;
            }
        },

        clearError: () => set({ error: null }),
    }),
    {
        name: 'auth-storage', // unique name for localStorage
        partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
)
);

