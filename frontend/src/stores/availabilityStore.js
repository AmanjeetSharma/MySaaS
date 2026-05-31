import { create } from 'zustand';
import { http } from '../api/httpClient';

export const useAvailabilityStore = create((set) => ({
  availability: null,
  isLoading: false,
  isSaving: false,
  isDeleting: false,
  error: null,

  getAvailability: async (serviceId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await http.get(`/availability/${serviceId}`);
      const { data } = response.data;

      set({
        availability: data || null,
        isLoading: false,
        error: null,
      });

      return data || null;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to fetch availability';

      set({
        availability: null,
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  createAvailability: async (serviceId, payload) => {
    set({ isSaving: true, error: null });

    try {
      const response = await http.post(`/availability/${serviceId}`, payload);
      const { data } = response.data;

      set({
        availability: data || null,
        isSaving: false,
        error: null,
      });

      return data || null;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to create availability';

      set({ isSaving: false, error: errorMessage });
      throw error;
    }
  },

  updateAvailability: async (serviceId, payload) => {
    set({ isSaving: true, error: null });

    try {
      const response = await http.patch(`/availability/${serviceId}`, payload);
      const { data } = response.data;

      set({
        availability: data || null,
        isSaving: false,
        error: null,
      });

      return data || null;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to update availability';

      set({ isSaving: false, error: errorMessage });
      throw error;
    }
  },

  deleteAvailability: async (serviceId) => {
    set({ isDeleting: true, error: null });

    try {
      const response = await http.delete(`/availability/${serviceId}`);

      set({
        availability: null,
        isDeleting: false,
        error: null,
      });

      return response.data?.data || null;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to delete availability';

      set({ isDeleting: false, error: errorMessage });
      throw error;
    }
  },

  clearAvailability: () => {
    set({
      availability: null,
      isLoading: false,
      isSaving: false,
      isDeleting: false,
      error: null,
    });
  },
}));
