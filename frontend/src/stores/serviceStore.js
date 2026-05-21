import { create } from 'zustand';
import { http } from '../api/httpClient';

const getServiceId = (service) => service?._id || service?.id || null;

const mergeService = (services, service) => {
    const serviceId = getServiceId(service);

    if (!serviceId) return services;

    const exists = services.some(item => getServiceId(item) === serviceId);

    if (!exists) {
        return [service, ...services];
    }

    return services.map(item =>
        getServiceId(item) === serviceId
            ? { ...item, ...service }
            : item
    );
};

export const useServiceStore = create((set) => ({
    services: [],
    currentOrganizationId: null,

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

        set({
            isLoading: true,
            error: null,
        });

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
                error.response?.data?.message ||
                'Failed to fetch services';

            set({
                isLoading: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    createService: async (payload) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.post('/services', payload);
            const { data } = response.data;

            set(state => ({
                services: mergeService(state.services, data),
                isUpdating: false,
                error: null,
            }));

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                'Failed to create service';

            set({
                isUpdating: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    updateService: async (serviceId, payload) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.patch(`/services/${serviceId}`, payload);
            const { data } = response.data;

            set(state => ({
                services: mergeService(state.services, data),
                isUpdating: false,
                error: null,
            }));

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                'Failed to update service';

            set({
                isUpdating: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    deleteService: async (serviceId) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            await http.delete(`/services/${serviceId}`);

            set(state => ({
                services: state.services.filter(service => getServiceId(service) !== serviceId),
                isUpdating: false,
                error: null,
            }));

            return true;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                'Failed to delete service';

            set({
                isUpdating: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    toggleServiceStatus: async (serviceId) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.patch(`/services/${serviceId}/toggle-status`);
            const { data } = response.data;

            set(state => ({
                services: state.services.map(service =>
                    getServiceId(service) === serviceId
                        ? { ...service, isActive: data.isActive }
                        : service
                ),
                isUpdating: false,
                error: null,
            }));

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                'Failed to toggle service status';

            set({
                isUpdating: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    toggleAutoGenerateMeetingLink: async (serviceId) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.patch(`/services/${serviceId}/toggle-auto-generate-meeting-link`);
            const { data } = response.data;

            set(state => ({
                services: state.services.map(service =>
                    getServiceId(service) === serviceId
                        ? { ...service, autoGenerateMeetingLink: data.autoGenerateMeetingLink }
                        : service
                ),
                isUpdating: false,
                error: null,
            }));

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                'Failed to toggle meeting link setting';

            set({
                isUpdating: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    getPublicServiceUrl: async (serviceId) => {
        try {
            const response = await http.get(`/services/${serviceId}/public-url`);
            return response.data.data?.publicUrl || '';
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                'Failed to fetch public service URL';

            set({ error: errorMessage });
            throw error;
        }
    },

    syncServiceSlug: async (serviceId) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.patch(`/services/${serviceId}/sync-slug`);
            const { data } = response.data;

            set(state => ({
                services: state.services.map(service =>
                    getServiceId(service) === serviceId
                        ? { ...service, slug: data.newSlug, isSlugStale: false }
                        : service
                ),
                isUpdating: false,
                error: null,
            }));

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                'Failed to sync service URL';

            set({
                isUpdating: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    clearServices: () => {
        set({
            services: [],
            currentOrganizationId: null,
            isLoading: false,
            isUpdating: false,
            error: null,
        });
    },
}));
