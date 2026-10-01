import { create } from 'zustand';
import { http } from '../api/httpClient';
import { toast } from 'sonner';

const initialStatus = {
    isConnected: false,
    email: null,
    connectedAt: null
};

const getResponseData = (response) => response.data?.data;

const getErrorMessage = (error, fallback) => (
    error.response?.data?.message || fallback
);

export const useZoomStore = create((set) => ({
    authUrl: null,
    status: initialStatus,
    statusOrgId: null,
    role: null,

    isLoading: false,
    isConnecting: false,
    isDisconnecting: false,
    error: null,

    connectZoom: async (orgId) => {
        set({
            isConnecting: true,
            error: null
        });

        try {
            const response = await http.get(`/providers/zoom/connect/${orgId}`);
            const data = getResponseData(response);

            set({
                authUrl: data?.authUrl || null,
                error: null
            });

            return {
                ...data,
                message: response.data?.message
            };
        } catch (error) {
            const errorMessage = getErrorMessage(
                error,
                'Failed to start Zoom connection'
            );

            set({
                isConnecting: false,
                error: errorMessage
            });

            throw error;
        }
    },

    redirectToZoom: async (orgId) => {
        const data = await useZoomStore.getState().connectZoom(orgId);

        if (!data?.authUrl) {
            useZoomStore.setState({ isConnecting: false });
            throw new Error('Zoom authorization URL was not returned');
        }

        window.location.href = data.authUrl;
        return data.authUrl;
    },

    getStatus: async (orgId) => {
        set({
            isLoading: true,
            isConnecting: false,
            error: null
        });

        try {
            const response = await http.get(`/providers/zoom/status/${orgId}`);
            const data = getResponseData(response) || initialStatus;

            set({
                status: data,
                statusOrgId: orgId,
                isLoading: false,
                error: null
            });

            return {
                ...data,
                message: response.data?.message
            };
        } catch (error) {
            const errorMessage = getErrorMessage(
                error,
                'Failed to fetch Zoom integration status'
            );

            set({
                isLoading: false,
                error: errorMessage
            });

            throw error;
        }
    },

    disconnectZoom: async (orgId) => {
        set({
            isDisconnecting: true,
            error: null
        });

        try {
            const response = await http.delete(`/providers/zoom/disconnect/${orgId}`);
            const data = getResponseData(response);

            set({
                authUrl: null,
                status: initialStatus,
                statusOrgId: orgId,
                role: null,
                isDisconnecting: false,
                error: null
            });

            toast.success(response.data?.message || 'Zoom account disconnected successfully.');

            return {
                ...data,
                message: response.data?.message
            };
        } catch (error) {
            const errorMessage = getErrorMessage(
                error,
                'Failed to disconnect Zoom account'
            );

            set({
                isDisconnecting: false,
                error: errorMessage
            });

            toast.error(errorMessage);
            throw error;
        }
    },

    clearError: () => set({ error: null }),

    resetZoomStore: () => set({
        authUrl: null,
        status: initialStatus,
        statusOrgId: null,
        role: null,
        isLoading: false,
        isConnecting: false,
        isDisconnecting: false,
        error: null
    })
}));
