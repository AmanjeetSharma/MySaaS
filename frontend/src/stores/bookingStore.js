import { create } from 'zustand';
import { http } from '../api/httpClient';
import { toastIcon } from '../constants/toastIcon.constant';
import { toast } from 'sonner';

export const useBookingStore = create((set, get) => ({
    // ============================================================
    // State
    // ============================================================

    bookings: [],
    booking: null,

    // Public booking/service data
    publicService: null,
    publicAvailability: null,

    // Pagination
    pagination: { page: 1, limit: 10, total: 0, overallTotal: 0, totalPages: 0 },

    isLoading: false,
    isSubmitting: false,
    error: null,

    // ============================================================
    // Public Booking
    // ============================================================

    getPublicService: async (orgSlug, serviceSlug) => {
        set({ isLoading: true, error: null, publicService: null, publicAvailability: null });

        try {
            const response = await http.get(`/services/public/${orgSlug}/${serviceSlug}`);
            const { data } = response.data;

            set({
                publicService: data.service,
                publicAvailability: data.availability,
                isLoading: false,
                error: null,
            });

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch service details.';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    createBooking: async (bookingData) => {
        set({ isSubmitting: true, error: null });

        try {
            const response = await http.post('/bookings', bookingData);

            set({ isSubmitting: false, error: null });
            toast.success(response.data?.message || 'Booking created successfully.', {
                icon: toastIcon('success'),
            });

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create booking.';
            set({ isSubmitting: false, error: errorMessage });
            throw error;
        }
    },

    getPublicBooking: async (token) => {
        set({ isLoading: true, error: null, booking: null });

        try {
            const response = await http.get(`/bookings/manage?token=${encodeURIComponent(token)}`);
            const { data } = response.data;

            set({ booking: data, isLoading: false, error: null });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch booking details.';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    publicRescheduleBooking: async (token, startTime) => {
        set({ isSubmitting: true, error: null });

        try {
            const response = await http.patch(
                `/bookings/manage/reschedule?token=${encodeURIComponent(token)}`,
                { startTime }
            );

            const { data } = response.data;

            set({
                booking: get().booking ? { ...get().booking, ...data } : data,
                isSubmitting: false,
                error: null,
            });

            toast.success(response.data?.message || 'Booking rescheduled successfully.', {
                icon: toastIcon('success'),
            });

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to reschedule booking.';
            set({ isSubmitting: false, error: errorMessage });
            throw error;
        }
    },

    publicCancelBooking: async (token, cancellationReason = null) => {
        set({ isSubmitting: true, error: null });

        try {
            const response = await http.patch(
                `/bookings/manage/cancel?token=${encodeURIComponent(token)}`,
                { cancellationReason }
            );

            const { data } = response.data;

            set({
                booking: get().booking ? { ...get().booking, ...data } : data,
                isSubmitting: false,
                error: null,
            });

            toast.success(response.data?.message || 'Booking cancelled successfully.', {
                icon: toastIcon('success'),
            });

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to cancel booking.';
            set({ isSubmitting: false, error: errorMessage });
            throw error;
        }
    },

    // ============================================================
    // Staff - Booking Lists
    // ============================================================

    getOrganizationBookings: async (orgId, params = {}) => {
        set({ isLoading: true, error: null });

        try {
            const response = await http.get(`/bookings/organization/${orgId}`, { params });
            const { data } = response.data;

            set({
                bookings: data.bookings,
                pagination: data.pagination,
                isLoading: false,
                error: null,
            });

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch organization bookings.';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    getServiceBookings: async (serviceId, params = {}) => {
        set({ isLoading: true, error: null });

        try {
            const response = await http.get(`/bookings/service/${serviceId}`, { params });
            const { data } = response.data;

            set({
                bookings: data.bookings,
                pagination: data.pagination,
                isLoading: false,
                error: null,
            });

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch service bookings.';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    // ============================================================
    // Staff - Single Booking
    // ============================================================

    getBookingById: async (bookingId, orgId) => {
        set({ isLoading: true, error: null, booking: null });

        try {
            const response = await http.get(`/bookings/${bookingId}`, {
                params: { orgId },
            });

            const { data } = response.data;

            set({ booking: data, isLoading: false, error: null });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch booking details.';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    updateBooking: async (bookingId, orgId, payload) => {
        set({ isSubmitting: true, error: null });

        try {
            const response = await http.patch(`/bookings/${bookingId}`, { orgId, ...payload });
            const { data } = response.data;

            set({ booking: data, isSubmitting: false, error: null });
            toast.success(response.data?.message || 'Booking updated successfully.', {
                icon: toastIcon('success'),
            });

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update booking.';
            set({ isSubmitting: false, error: errorMessage });
            throw error;
        }
    },

    updateBookingStatus: async (bookingId, orgId, status) => {
        set({ isSubmitting: true, error: null });

        try {
            const response = await http.patch(`/bookings/${bookingId}/status`, { orgId, status });
            const { data } = response.data;

            set({ booking: data, isSubmitting: false, error: null });
            toast.success(response.data?.message || 'Booking status updated successfully.', {
                icon: toastIcon('success'),
            });

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update booking status.';
            set({ isSubmitting: false, error: errorMessage });
            throw error;
        }
    },

    rescheduleBooking: async (bookingId, orgId, startTime) => {
        set({ isSubmitting: true, error: null });

        try {
            const response = await http.patch(`/bookings/${bookingId}/reschedule`, { orgId, startTime });
            const { data } = response.data;

            set({ booking: data, isSubmitting: false, error: null });
            toast.success(response.data?.message || 'Booking rescheduled successfully.', {
                icon: toastIcon('success'),
            });

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to reschedule booking.';
            set({ isSubmitting: false, error: errorMessage });
            throw error;
        }
    },

    cancelBooking: async (bookingId, orgId, cancellationReason = null) => {
        set({ isSubmitting: true, error: null });

        try {
            const response = await http.patch(`/bookings/${bookingId}/cancel`, {
                orgId,
                cancellationReason,
            });

            const { data } = response.data;

            set({ booking: data, isSubmitting: false, error: null });
            toast.success(response.data?.message || 'Booking cancelled successfully.', {
                icon: toastIcon('success'),
            });

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to cancel booking.';
            set({ isSubmitting: false, error: errorMessage });
            throw error;
        }
    },

    // ============================================================
    // State Helpers
    // ============================================================

    clearBooking: () => {
        set({ booking: null, error: null });
    },

    clearPublicBooking: () => {
        set({ booking: null, publicService: null, publicAvailability: null, error: null });
    },

    clearError: () => {
        set({ error: null });
    },

    resetBookings: () => {
        set({
            bookings: [],
            booking: null,
            publicService: null,
            publicAvailability: null,
            pagination: { page: 1, limit: 10, total: 0, overallTotal: 0, totalPages: 0 },
            isLoading: false,
            isSubmitting: false,
            error: null,
        });
    },
}));