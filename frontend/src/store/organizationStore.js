import { create } from 'zustand';
import { http } from '../api/httpClient';

export const useOrganizationStore = create((set, get) => ({
    // State
    organizations: [],
    currentOrganization: null,
    isLoading: false,
    error: null,
    isUpdating: false,

    // Organization CRUD Actions
    createOrganization: async (orgName) => {
        set({ isUpdating: true, error: null });
        try {
            const response = await http.post('/organizations', { orgName });
            const { data } = response.data;

            // Add new organization to list and set as current
            set({
                organizations: [data, ...get().organizations],
                currentOrganization: data,
                isUpdating: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create organization';
            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    getOrganizations: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await http.get('/organizations');
            const { data } = response.data;

            set({
                organizations: data,
                isLoading: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch organizations';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    getOrganization: async (orgId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await http.get(`/organizations/${orgId}`);
            const { data } = response.data;

            set({
                currentOrganization: data,
                isLoading: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch organization';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    updateOrganization: async (orgId, orgName) => {
        set({ isUpdating: true, error: null });
        try {
            const response = await http.patch(`/organizations/${orgId}`, { orgName });
            const { data } = response.data;

            // Update organization in list
            const updatedOrganizations = get().organizations.map(org =>
                org._id === orgId ? data : org
            );

            set({
                organizations: updatedOrganizations,
                currentOrganization: get().currentOrganization?._id === orgId ? data : get().currentOrganization,
                isUpdating: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update organization';
            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    deleteOrganization: async (orgId) => {
        set({ isUpdating: true, error: null });
        try {
            await http.delete(`/organizations/${orgId}`);

            // Remove organization from list
            const remainingOrgs = get().organizations.filter(org => org._id !== orgId);

            // If deleted org was current, set current to first available or null
            const isCurrentDeleted = get().currentOrganization?._id === orgId;
            const newCurrentOrg = isCurrentDeleted && remainingOrgs.length > 0 ? remainingOrgs[0] : get().currentOrganization;

            set({
                organizations: remainingOrgs,
                currentOrganization: isCurrentDeleted ? newCurrentOrg : get().currentOrganization,
                isUpdating: false,
                error: null
            });

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete organization';
            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    switchOrganization: async (orgId) => {
        set({ isUpdating: true, error: null });
        try {
            const response = await http.post(`/organizations/${orgId}/switch`);
            const { data } = response.data;

            // Find the organization object
            const organization = get().organizations.find(org => org._id === orgId);

            set({
                currentOrganization: organization || null,
                isUpdating: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to switch organization';
            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    // Helper Methods
    setCurrentOrganization: (organization) => {
        set({ currentOrganization: organization });
    },

    clearError: () => set({ error: null }),

    resetOrganizationStore: () => set({
        organizations: [],
        currentOrganization: null,
        isLoading: false,
        error: null,
        isUpdating: false
    }),
}));