import { create } from 'zustand';
import { http } from '../api/httpClient';
import { toast } from 'sonner';

const initialStatus = {
    isConnected: false,
    email: null,
    connectedAt: null,
    calendarId: null
};

const getResponseData = (response) => response.data?.data;

const getErrorMessage = (error, fallback) => (
    error.response?.data?.message || fallback
);

export const useGoogleStore = create((set) => ({
    authUrl: null,
    status: initialStatus,
    statusOrgId: null,
    calendars: [],
    calendarsOrgId: null,
    role: null,

    isLoading: false,
    isConnecting: false,
    isDisconnecting: false,
    isFetchingCalendars: false,
    isUpdatingCalendar: false,
    error: null,

    connectGoogle: async (orgId) => {
        set({
            isConnecting: true,
            error: null
        });

        try {
            const response = await http.get(`/providers/google/connect/${orgId}`);
            const data = getResponseData(response);

            set({
                authUrl: data?.authUrl || null,
                isConnecting: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(
                error,
                'Failed to start Google connection'
            );

            set({
                isConnecting: false,
                error: errorMessage
            });

            throw error;
        }
    },

    redirectToGoogle: async (orgId) => {
        const data = await useGoogleStore.getState().connectGoogle(orgId);

        if (!data?.authUrl) {
            throw new Error('Google authorization URL was not returned');
        }

        window.location.href = data.authUrl;
        return data.authUrl;
    },

    handleCallback: async ({ code, state }) => {
        set({
            isLoading: true,
            error: null
        });

        try {
            const response = await http.get('/providers/google/callback', {
                params: { code, state }
            });
            const data = getResponseData(response);

            set({
                status: {
                    ...initialStatus,
                    isConnected: true,
                    email: data?.email || null,
                    connectedAt: data?.connectedAt || null
                },
                statusOrgId: data?.orgId || null,
                calendars: [],
                calendarsOrgId: null,
                role: null,
                isLoading: false,
                error: null
            });

            toast.success(response.data?.message || 'Google account connected successfully.');

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(
                error,
                'Failed to complete Google connection'
            );

            set({
                isLoading: false,
                error: errorMessage
            });

            toast.error(errorMessage);
            throw error;
        }
    },

    updateSelectedCalendar: async (orgId, calendarId) => {
        set({
            isUpdatingCalendar: true,
            error: null
        });

        try {
            const response = await http.patch(
                `/providers/google/calendar/${orgId}`,
                {
                    calendarId
                }
            );

            const data = getResponseData(response);

            set((state) => ({
                status: {
                    ...state.status,
                    calendarId: data?.calendarId || state.status.calendarId
                },

                calendars: state.calendars.map((calendar) => ({
                    ...calendar,
                    selected: calendar.id === data?.calendarId
                })),

                isUpdatingCalendar: false,
                error: null
            }));

            toast.success(
                response.data?.message || 'Google calendar updated successfully.'
            );

            return data;

        } catch (error) {
            const errorMessage = getErrorMessage(
                error,
                'Failed to update Google calendar'
            );

            set({
                isUpdatingCalendar: false,
                error: errorMessage
            });

            toast.error(errorMessage);

            throw error;
        }
    },

    getStatus: async (orgId) => {
        set({
            isLoading: true,
            error: null
        });

        try {
            const response = await http.get(`/providers/google/status/${orgId}`);
            const data = getResponseData(response) || initialStatus;

            set((state) => ({
                status: data,
                statusOrgId: orgId,
                calendars:
                    data?.isConnected && state.calendarsOrgId === orgId
                        ? state.calendars
                        : [],
                calendarsOrgId:
                    data?.isConnected && state.calendarsOrgId === orgId
                        ? state.calendarsOrgId
                        : null,
                role:
                    data?.isConnected && state.calendarsOrgId === orgId
                        ? state.role
                        : null,
                isLoading: false,
                error: null
            }));

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(
                error,
                'Failed to fetch Google integration status'
            );

            set({
                isLoading: false,
                error: errorMessage
            });

            throw error;
        }
    },

    listCalendars: async (orgId) => {
        set({
            isFetchingCalendars: true,
            error: null
        });

        try {
            const response = await http.get(`/providers/google/calendars/${orgId}`);
            const data = getResponseData(response);

            const calendarsList = Array.isArray(data) ? data : (data?.calendars || []);
            const userRole = data?.role || null;

            set({
                calendars: calendarsList,
                calendarsOrgId: orgId,
                role: userRole,
                isFetchingCalendars: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(
                error,
                'Failed to fetch Google calendars'
            );

            set({
                isFetchingCalendars: false,
                error: errorMessage
            });

            throw error;
        }
    },

    disconnectGoogle: async (orgId) => {
        set({
            isDisconnecting: true,
            error: null
        });

        try {
            const response = await http.delete(`/providers/google/disconnect/${orgId}`);
            const data = getResponseData(response);

            set({
                authUrl: null,
                status: initialStatus,
                statusOrgId: orgId,
                calendars: [],
                calendarsOrgId: null,
                role: null,
                isDisconnecting: false,
                error: null
            });

            toast.success(response.data?.message || 'Google account disconnected successfully.');

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(
                error,
                'Failed to disconnect Google account'
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

    resetGoogleStore: () => set({
        authUrl: null,
        status: initialStatus,
        statusOrgId: null,
        calendars: [],
        calendarsOrgId: null,
        role: null,
        isLoading: false,
        isConnecting: false,
        isDisconnecting: false,
        isFetchingCalendars: false,
        isUpdatingCalendar: false,
        error: null
    })
}));
