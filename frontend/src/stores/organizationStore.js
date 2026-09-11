import { create } from 'zustand';
import { http } from '../api/httpClient';
import { useUserStore } from './userStore';

const getEntityId = (entity) => {
    if (!entity) return null;
    if (typeof entity === 'string') return entity;
    return entity._id || entity.id || null;
};

const isSameId = (left, right) => {
    const leftId = getEntityId(left);
    const rightId = getEntityId(right);

    return !!leftId && !!rightId && leftId.toString() === rightId.toString();
};

const mergeOrganizationById = (organizations, organization) => {
    const exists = organizations.some((org) => isSameId(org, organization));

    if (!exists) {
        return [...organizations, organization];
    }

    return organizations.map((org) =>
        isSameId(org, organization) ? organization : org
    );
};

export const useOrganizationStore = create((set, get) => ({
    ownedOrganization: null,
    memberOrganizations: [],
    currentOrganization: null,

    isLoading: false,
    isUpdating: false,
    error: null,

    getAllOrganizations: () => {
        const { ownedOrganization, memberOrganizations } = get();

        return [
            ...(ownedOrganization ? [ownedOrganization] : []),
            ...memberOrganizations,
        ];
    },

    getOrganizationById: (orgId) => {
        return (
            get()
                .getAllOrganizations()
                .find((org) => org._id === orgId) || null
        );
    },

    hasOwnedOrganization: () => {
        return !!get().ownedOrganization;
    },

    syncCurrentOrganization: (activeOrganizationId) => {
        if (!activeOrganizationId) {
            set({ currentOrganization: null });
            return;
        }

        const organization = get().getOrganizationById(activeOrganizationId);

        set({
            currentOrganization: organization || null,
        });
    },

    getOrganizations: async (activeOrganizationId = null) => {
        set({
            isLoading: true,
            error: null,
        });

        try {
            const response = await http.get('/organizations');
            const { data } = response.data;

            const ownedOrganization = data?.ownedOrganization || null;
            const memberOrganizations = data?.memberOrganizations || [];

            let currentOrganization = null;

            if (activeOrganizationId) {
                currentOrganization =
                    [
                        ...(ownedOrganization ? [ownedOrganization] : []),
                        ...memberOrganizations,
                    ].find((org) => org._id === activeOrganizationId) || null;
            }

            set({
                ownedOrganization,
                memberOrganizations,
                currentOrganization,
                isLoading: false,
                error: null,
            });

            return data;
        } catch (error) {
            // Treat 404 as empty state instead of a failure
            if (error?.response?.status === 404) {
                set({
                    ownedOrganization: null,
                    memberOrganizations: [],
                    currentOrganization: null,
                    isLoading: false,
                    error: null,
                });

                return {
                    ownedOrganization: null,
                    memberOrganizations: [],
                };
            }

            const errorMessage =
                error.response?.data?.message || 'Failed to fetch organizations';

            set({
                isLoading: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    getOrganization: async (orgId) => {
        set({
            isLoading: true,
            error: null,
        });

        try {
            const response = await http.get(`/organizations/${orgId}`);
            const { data } = response.data;

            const { ownedOrganization, memberOrganizations, currentOrganization } = get();

            const currentUserId = useUserStore.getState().userProfile?._id;
            const isOwner = isSameId(data?.owner, currentUserId);

            const updatedOwnedOrganization = isOwner
                ? data
                : isSameId(ownedOrganization, data)
                    ? null
                    : ownedOrganization;

            const updatedMemberOrganizations = isOwner
                ? memberOrganizations.filter((org) => !isSameId(org, data))
                : mergeOrganizationById(memberOrganizations, data);

            set({
                ownedOrganization: updatedOwnedOrganization,
                memberOrganizations: updatedMemberOrganizations,
                currentOrganization: isSameId(currentOrganization, data)
                    ? data
                    : currentOrganization,
                isLoading: false,
                error: null,
            });

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to fetch organization';

            set({
                isLoading: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    createOrganization: async (orgName) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.post('/organizations', { orgName });
            const { data } = response.data;

            set({
                ownedOrganization: data,
                currentOrganization: data,
                isUpdating: false,
                error: null,
            });

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to create organization';

            set({
                isUpdating: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    updateOrganization: async (orgId, { orgName, description }) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.patch(`/organizations/${orgId}`, {
                orgName,
                description,
            });

            const { data } = response.data;
            const { ownedOrganization, memberOrganizations, currentOrganization } = get();

            let updatedOwnedOrganization = ownedOrganization;
            let updatedMemberOrganizations = [...memberOrganizations];

            if (ownedOrganization && ownedOrganization._id === orgId) {
                updatedOwnedOrganization = data;
            }

            updatedMemberOrganizations = updatedMemberOrganizations.map((org) =>
                org._id === orgId ? data : org
            );

            set({
                ownedOrganization: updatedOwnedOrganization,
                memberOrganizations: updatedMemberOrganizations,
                currentOrganization:
                    currentOrganization?._id === orgId ? data : currentOrganization,
                isUpdating: false,
                error: null,
            });

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to update organization';

            set({
                isUpdating: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    deleteOrganization: async (orgId) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            await http.delete(`/organizations/${orgId}`);

            const { ownedOrganization, memberOrganizations, currentOrganization } = get();

            const updatedOwnedOrganization =
                ownedOrganization?._id === orgId ? null : ownedOrganization;

            const updatedMemberOrganizations = memberOrganizations.filter(
                (org) => org._id !== orgId
            );

            set({
                ownedOrganization: updatedOwnedOrganization,
                memberOrganizations: updatedMemberOrganizations,
                currentOrganization:
                    currentOrganization?._id === orgId ? null : currentOrganization,
                isUpdating: false,
                error: null,
            });

            return true;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to delete organization';

            set({
                isUpdating: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    switchOrganization: async (orgId) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.post(`/organizations/${orgId}/switch`);
            const organization = get().getOrganizationById(orgId);

            set({
                currentOrganization: organization || null,
                isUpdating: false,
                error: null,
            });

            return response.data.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to switch organization';

            set({
                isUpdating: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    syncOrganizationSlug: async (orgId) => {
        set({
            isUpdating: true,
            error: null,
        });

        try {
            const response = await http.post(`/organizations/${orgId}/sync-slug`);
            const { data } = response.data;

            const { ownedOrganization, memberOrganizations, currentOrganization } = get();

            const updateSlug = (organization) => {
                if (!organization || organization._id !== orgId) {
                    return organization;
                }

                return {
                    ...organization,
                    slug: data.slug,
                    isSlugStale: false,
                };
            };

            set({
                ownedOrganization: updateSlug(ownedOrganization),
                memberOrganizations: memberOrganizations.map(updateSlug),
                currentOrganization: updateSlug(currentOrganization),
                isUpdating: false,
                error: null,
            });

            return data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to synchronize organization URL';

            set({
                isUpdating: false,
                error: errorMessage,
            });

            throw error;
        }
    },

    setCurrentOrganization: (organization) => {
        set({
            currentOrganization: organization,
        });
    },

    clearError: () => {
        set({
            error: null,
        });
    },

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