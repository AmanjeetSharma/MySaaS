import { create } from 'zustand';
import { http } from '../api/httpClient';

const getServiceId = (service) => service?._id || service?.id || null;

const mergeService = (services, service) => {
    const serviceId = getServiceId(service);
    if (!serviceId) return services;

    const exists = services.some((item) => getServiceId(item) === serviceId);

    if (!exists) {
        return [service, ...services];
    }

    return services.map((item) =>
        getServiceId(item) === serviceId ? { ...item, ...service } : item
    );
};

export const useServiceStore = create((set) => ({
    services: [],
    currentOrganizationId: null,
    publicService: null,
    selectedService: null,

    isLoading: false,
    isUpdating: false,
    error: null,

    getOrganizationServices: async (organizationId) => {
        if (!organizationId) {
            set({
                services: [],
                currentOrganizationId: null,
                isLoading: false,
                error: null,
            });
            return [];
        }

        set({ isLoading: true, error: null });

        try {
            const response = await http.get(`/services/organization/${organizationId}`);
            const { data } = response.data;

            set({
                services: data || [],
                currentOrganizationId: organizationId,
                isLoading: false,
                error: null,
            });

            return data || [];
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to fetch services';

            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    createService: async (payload) => {
        set({ isUpdating: true, error: null });

        try {
            const response = await http.post('/services', payload);
            const { data } = response.data;

            set((state) => ({
                services: mergeService(state.services, data),
                isUpdating: false,
                error: null,
            }));

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to create service';

            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    updateService: async (serviceId, payload) => {
        set({ isUpdating: true, error: null });

        try {
            const response = await http.patch(`/services/${serviceId}`, payload);
            const { data } = response.data;

            set((state) => ({
                services: mergeService(state.services, data),
                selectedService:
                    getServiceId(state.selectedService) === serviceId
                        ? { ...state.selectedService, ...data }
                        : state.selectedService,
                isUpdating: false,
                error: null,
            }));

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to update service';

            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    getServiceById: async (serviceId) => {
        set({ isLoading: true, error: null });

        try {
            const response = await http.get(`/services/${serviceId}`);
            const { data } = response.data;

            set((state) => ({
                selectedService: data,
                services: mergeService(state.services, data),
                isLoading: false,
                error: null,
            }));

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to fetch service';

            set({
                selectedService: null,
                isLoading: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    deleteService: async (serviceId) => {
        set({ isUpdating: true, error: null });

        try {
            await http.delete(`/services/${serviceId}`);

            set((state) => ({
                services: state.services.filter(
                    (service) => getServiceId(service) !== serviceId
                ),
                isUpdating: false,
                error: null,
            }));

            return true;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to delete service';

            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    toggleServiceStatus: async (serviceId) => {
        set({ isUpdating: true, error: null });

        try {
            const response = await http.patch(`/services/${serviceId}/toggle-status`);
            const { data } = response.data;

            set((state) => ({
                services: state.services.map((service) =>
                    getServiceId(service) === serviceId
                        ? { ...service, isActive: data.isActive }
                        : service
                ),
                selectedService:
                    getServiceId(state.selectedService) === serviceId
                        ? { ...state.selectedService, isActive: data.isActive }
                        : state.selectedService,
                isUpdating: false,
                error: null,
            }));

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to toggle service status';

            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    toggleAutoGenerateMeetingLink: async (serviceId) => {
        set({ isUpdating: true, error: null });

        try {
            const response = await http.patch(
                `/services/${serviceId}/toggle-auto-generate-meeting-link`
            );
            const { data } = response.data;

            set((state) => ({
                services: state.services.map((service) =>
                    getServiceId(service) === serviceId
                        ? { ...service, autoGenerateMeetingLink: data.autoGenerateMeetingLink }
                        : service
                ),
                selectedService:
                    getServiceId(state.selectedService) === serviceId
                        ? { ...state.selectedService, autoGenerateMeetingLink: data.autoGenerateMeetingLink }
                        : state.selectedService,
                isUpdating: false,
                error: null,
            }));

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to toggle meeting link setting';

            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    syncServiceSlug: async (serviceId) => {
        set({ isUpdating: true, error: null });

        try {
            const response = await http.patch(`/services/${serviceId}/sync-slug`);
            const { data } = response.data;

            set((state) => ({
                services: state.services.map((service) =>
                    getServiceId(service) === serviceId
                        ? { ...service, slug: data.newSlug, publicUrl: data.publicUrl || service.publicUrl, isSlugStale: false }
                        : service
                ),
                selectedService:
                    getServiceId(state.selectedService) === serviceId
                        ? { ...state.selectedService, slug: data.newSlug, publicUrl: data.publicUrl || state.selectedService.publicUrl, isSlugStale: false }
                        : state.selectedService,
                isUpdating: false,
                error: null,
            }));

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to sync service URL';

            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    getServiceBySlug: async (orgSlug, serviceSlug) => {
        set({ isLoading: true, error: null });

        try {
            const response = await http.get(
                `/services/public/${orgSlug}/${serviceSlug}`
            );
            const { data } = response.data;

            set({
                publicService: data,
                isLoading: false,
                error: null,
            });

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to fetch service.';

            set({
                publicService: null,
                isLoading: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    clearServices: () => {
        set({
            services: [],
            currentOrganizationId: null,
            selectedService: null,
            isLoading: false,
            isUpdating: false,
            error: null,
        });
    },
    clearSelectedService: () => {
        set({
            selectedService: null,
            error: null,
        });
    },
    clearPublicService: () => {
        set({
            publicService: null,
            isLoading: false,
            error: null,
        });
    },
}));