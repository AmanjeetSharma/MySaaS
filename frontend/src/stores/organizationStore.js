// organizationStore.js

import { create } from 'zustand';
import { http } from '../api/httpClient';

export const useOrganizationStore = create((set, get) => ({
    // =========================================================
    // STATE
    // =========================================================

    ownedOrganization: null,
    memberOrganizations: [],
    currentOrganization: null,

    isLoading: false,
    isUpdating: false,
    error: null,

    // =========================================================
    // HELPERS
    // =========================================================

    getAllOrganizations: () => {
        const {
            ownedOrganization,
            memberOrganizations,
        } = get();

        return [
            ...(ownedOrganization
                ? [ownedOrganization]
                : []),
            ...memberOrganizations,
        ];
    },

    getOrganizationById: (orgId) => {
        return (
            get()
                .getAllOrganizations()
                .find(
                    (org) =>
                        org._id === orgId
                ) || null
        );
    },

    hasOwnedOrganization: () => {
        return !!get().ownedOrganization;
    },

    // =========================================================
    // GET ORGANIZATIONS
    // =========================================================

    getOrganizations: async () => {
        set({
            isLoading: true,
            error: null,
        });

        try {
            const response =
                await http.get(
                    '/organizations'
                );

            const { data } =
                response.data;

            set({
                ownedOrganization:
                    data?.ownedOrganization ||
                    null,

                memberOrganizations:
                    data?.memberOrganizations ||
                    [],

                // IMPORTANT:
                // current org is controlled
                // by user.activeOrganization
                // NOT auto guessed here
                isLoading: false,
                error: null,
            });

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data
                    ?.message ||
                'Failed to fetch organizations';

            set({
                isLoading: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    // =========================================================
    // CREATE ORGANIZATION
    // =========================================================

    createOrganization: async (
        orgName
    ) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response =
                await http.post(
                    '/organizations',
                    {
                        orgName,
                    }
                );

            const { data } =
                response.data;

            set({
                ownedOrganization: data,
                currentOrganization: data,

                isUpdating: false,
                error: null,
            });

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data
                    ?.message ||
                'Failed to create organization';

            set({
                isUpdating: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    // =========================================================
    // SWITCH ORGANIZATION
    // =========================================================

    switchOrganization: async (
        orgId
    ) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response =
                await http.post(
                    `/organizations/${orgId}/switch`
                );

            const organization =
                get().getOrganizationById(
                    orgId
                );

            set({
                currentOrganization:
                    organization,

                isUpdating: false,
                error: null,
            });

            return response.data.data;
        } catch (error) {
            const errorMessage =
                error.response?.data
                    ?.message ||
                'Failed to switch organization';

            set({
                isUpdating: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    // =========================================================
    // SET CURRENT ORGANIZATION
    // =========================================================

    setCurrentOrganization: (
        organization
    ) => {
        set({
            currentOrganization:
                organization,
        });
    },

    // =========================================================
    // CLEAR ERROR
    // =========================================================

    clearError: () => {
        set({
            error: null,
        });
    },

    // =========================================================
    // RESET
    // =========================================================

    resetOrganizationStore: () => {
        set({
            ownedOrganization: null,
            memberOrganizations: [],
            currentOrganization: null,

            isLoading: false,
            isUpdating: false,
            error: null,
        });
    },
}));