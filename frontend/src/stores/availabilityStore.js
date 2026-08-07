import { create } from "zustand";
import { http } from "../api/httpClient";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export const useAvailabilityStore = create((set) => ({
  availability: null,

  isLoading: false,
  isSaving: false,
  isDeleting: false,

  error: null,

  getAvailability: async (serviceId) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const response = await http.get(`/availability/${serviceId}`);
      const availability = response.data.data;

      set({
        availability: availability || null,
      });

      return availability || null;
    } catch (error) {
      set({
        availability: null,
        error: getErrorMessage(
          error,
          "Failed to fetch availability"
        ),
      });

      throw error;
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  createAvailability: async (serviceId, payload) => {
    set({
      isSaving: true,
      error: null,
    });

    try {
      const response = await http.post(
        `/availability/${serviceId}`,
        payload
      );

      const availability = response.data.data;

      set({
        availability: availability || null,
      });

      return availability || null;
    } catch (error) {
      set({
        error: getErrorMessage(
          error,
          "Failed to create availability"
        ),
      });

      throw error;
    } finally {
      set({
        isSaving: false,
      });
    }
  },

  updateAvailability: async (serviceId, payload) => {
    set({
      isSaving: true,
      error: null,
    });

    try {
      const response = await http.patch(
        `/availability/${serviceId}`,
        payload
      );

      const availability = response.data.data;

      set({
        availability: availability || null,
      });

      return availability || null;
    } catch (error) {
      set({
        error: getErrorMessage(
          error,
          "Failed to update availability"
        ),
      });

      throw error;
    } finally {
      set({
        isSaving: false,
      });
    }
  },

  deleteAvailability: async (serviceId) => {
    set({
      isDeleting: true,
      error: null,
    });

    try {
      const response = await http.delete(
        `/availability/${serviceId}`
      );

      set({
        availability: null,
      });

      return response.data.data;
    } catch (error) {
      set({
        error: getErrorMessage(error, "Failed to delete availability"),
      });

      throw error;
    } finally {
      set({
        isDeleting: false,
      });
    }
  },

  clearAvailability: () =>
    set({
      availability: null,
      isLoading: false,
      isSaving: false,
      isDeleting: false,
      error: null,
    }),
}));