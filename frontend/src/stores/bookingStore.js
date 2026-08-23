import { create } from "zustand";
import { toast } from "sonner";
import { axiosInstance } from "../api/httpClient.js";
import { toastIcon } from "../constants/toastIcon.constant";
import {
    DEFAULT_PAGINATION,
    compactObject,
    getErrorMessage,
    normalizePagination,
} from "../utils/crmStore.utils";

let orgBookingsController = null;
let serviceBookingsController = null;

export const useBookingStore = create((set) => ({
    // Booking Data & Pagination
    booking: null,
    bookings: [],
    pagination: DEFAULT_PAGINATION,

    // Loading & Error States
    isLoadingBooking: false,
    isLoadingBookings: false,
    isRescheduling: false,
    isCancelling: false,
    isUpdating: false,
    isUpdatingStatus: false,
    bookingError: null,

    // --- Public Actions (Token-based) ---
    getPublicBooking: async (token) => {
        try {
            set({ isLoadingBooking: true, bookingError: null });
            const response = await axiosInstance.get(
                `/bookings/manage?token=${encodeURIComponent(token)}`
            );
            const bookingData = response.data.data;
            set({ booking: bookingData });
            return bookingData;
        } catch (error) {
            const message =
                error?.response?.data?.message || "Unable to fetch booking details.";
            set({ bookingError: message });
            throw error;
        } finally {
            set({ isLoadingBooking: false });
        }
    },

    publicRescheduleBooking: async ({ token, startTime }) => {
        try {
            set({ isRescheduling: true, bookingError: null });
            const response = await axiosInstance.patch(
                `/bookings/manage/reschedule?token=${encodeURIComponent(token)}`,
                { startTime }
            );
            const bookingData = response.data.data;
            set({ booking: bookingData });
            return bookingData;
        } catch (error) {
            const message =
                error?.response?.data?.message || "Unable to reschedule booking.";
            set({ bookingError: message });
            throw error;
        } finally {
            set({ isRescheduling: false });
        }
    },

    publicCancelBooking: async ({ token, cancellationReason }) => {
        try {
            set({ isCancelling: true, bookingError: null });
            const response = await axiosInstance.patch(
                `/bookings/manage/cancel?token=${encodeURIComponent(token)}`,
                { cancellationReason }
            );
            const bookingData = response.data.data;
            set({ booking: bookingData });
            return bookingData;
        } catch (error) {
            const message =
                error?.response?.data?.message || "Unable to cancel booking.";
            set({ bookingError: message });
            throw error;
        } finally {
            set({ isCancelling: false });
        }
    },

    // --- Staff Actions: Booking Lists ---
    getOrganizationBookings: async ({ orgId, ...query }) => {
        if (!orgId) {
            set({
                bookings: [],
                pagination: DEFAULT_PAGINATION,
                isLoadingBookings: false,
                bookingError: null,
            });
            return [];
        }

        set({ isLoadingBookings: true, bookingError: null });
        let controller = null;

        try {
            orgBookingsController?.abort();
            controller = new AbortController();
            orgBookingsController = controller;

            const response = await axiosInstance.get(
                `/bookings/organization/${orgId}`,
                {
                    params: compactObject(query),
                    signal: controller.signal,
                }
            );

            const data = response.data.data || {};
            set({
                bookings: data.bookings || [],
                pagination: normalizePagination(data.pagination),
                bookingError: null,
            });
            return data;
        } catch (error) {
            if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
                return;
            }

            const errorMessage = getErrorMessage(
                error,
                "Unable to fetch organization bookings."
            );
            set({ bookingError: errorMessage });
            toast.error(errorMessage, { icon: toastIcon("error") });
            throw error;
        } finally {
            if (orgBookingsController === controller) {
                orgBookingsController = null;
            }
            set({ isLoadingBookings: false });
        }
    },

    getServiceBookings: async ({ serviceId, ...query }) => {
        if (!serviceId) {
            set({
                bookings: [],
                pagination: DEFAULT_PAGINATION,
                isLoadingBookings: false,
                bookingError: null,
            });
            return [];
        }

        set({ isLoadingBookings: true, bookingError: null });
        let controller = null;

        try {
            serviceBookingsController?.abort();
            controller = new AbortController();
            serviceBookingsController = controller;

            const response = await axiosInstance.get(
                `/bookings/service/${serviceId}`,
                {
                    params: compactObject(query),
                    signal: controller.signal,
                }
            );

            const data = response.data.data || {};
            set({
                bookings: data.bookings || [],
                pagination: normalizePagination(data.pagination),
                bookingError: null,
            });
            return data;
        } catch (error) {
            if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
                return;
            }

            const message = getErrorMessage(
                error,
                "Unable to fetch service bookings."
            );
            set({ bookingError: message });
            toast.error(message, { icon: toastIcon("error") });
            throw error;
        } finally {
            if (serviceBookingsController === controller) {
                serviceBookingsController = null;
            }
            set({ isLoadingBookings: false });
        }
    },

    // --- Staff Actions: Single Booking Operations ---
    getBookingById: async ({ bookingId, orgId }) => {
        try {
            set({ isLoadingBooking: true, bookingError: null });
            const response = await axiosInstance.get(`/bookings/${bookingId}`, {
                params: { orgId },
            });
            const bookingData = response.data.data;
            set({ booking: bookingData });
            return bookingData;
        } catch (error) {
            const message =
                error?.response?.data?.message || "Unable to fetch booking details.";
            set({ bookingError: message });
            throw error;
        } finally {
            set({ isLoadingBooking: false });
        }
    },

    updateBooking: async ({ bookingId, orgId, payload }) => {
        try {
            set({ isUpdating: true, bookingError: null });
            const response = await axiosInstance.patch(`/bookings/${bookingId}`, {
                orgId,
                ...payload,
            });
            const bookingData = response.data.data;
            set({ booking: bookingData });
            return bookingData;
        } catch (error) {
            const message =
                error?.response?.data?.message || "Unable to update booking.";
            set({ bookingError: message });
            throw error;
        } finally {
            set({ isUpdating: false });
        }
    },

    updateBookingStatus: async ({ bookingId, orgId, status }) => {
        try {
            set({ isUpdatingStatus: true, bookingError: null });
            const response = await axiosInstance.patch(
                `/bookings/${bookingId}/status`,
                {
                    orgId,
                    status,
                }
            );
            const bookingData = response.data.data;
            set({ booking: bookingData });
            return bookingData;
        } catch (error) {
            const message =
                error?.response?.data?.message || "Unable to update booking status.";
            set({ bookingError: message });
            throw error;
        } finally {
            set({ isUpdatingStatus: false });
        }
    },

    rescheduleBooking: async ({ bookingId, orgId, startTime }) => {
        try {
            set({ isRescheduling: true, bookingError: null });
            const response = await axiosInstance.patch(
                `/bookings/${bookingId}/reschedule`,
                {
                    orgId,
                    startTime,
                }
            );
            const bookingData = response.data.data;
            set({ booking: bookingData });
            return bookingData;
        } catch (error) {
            const message =
                error?.response?.data?.message || "Unable to reschedule booking.";
            set({ bookingError: message });
            throw error;
        } finally {
            set({ isRescheduling: false });
        }
    },

    cancelBooking: async ({ bookingId, orgId, cancellationReason }) => {
        try {
            set({ isCancelling: true, bookingError: null });
            const response = await axiosInstance.patch(
                `/bookings/${bookingId}/cancel`,
                {
                    orgId,
                    cancellationReason,
                }
            );
            const bookingData = response.data.data;
            set({ booking: bookingData });
            return bookingData;
        } catch (error) {
            const message =
                error?.response?.data?.message || "Unable to cancel booking.";
            set({ bookingError: message });
            throw error;
        } finally {
            set({ isCancelling: false });
        }
    },

    clearBooking: () => {
        set({ booking: null, bookingError: null });
    },

    clearBookings: () => {
        set({ bookings: [], pagination: DEFAULT_PAGINATION });
    },

    clearPublicBooking: () => {
        set({
            booking: null,
            bookingError: null,
        });
    },

    clearBookingError: () => {
        set({ bookingError: null });
    },

    resetBookingStore: () => {
        set({
            booking: null,
            bookings: [],
            pagination: DEFAULT_PAGINATION,
            isLoadingBooking: false,
            isLoadingBookings: false,
            isRescheduling: false,
            isCancelling: false,
            isUpdating: false,
            isUpdatingStatus: false,
            bookingError: null,
        });
    },
}));