import { create } from 'zustand';
import { http } from '../api/httpClient';

export const useMemberStore = create((set, get) => ({
    // State
    members: [],
    pendingInvitations: [],
    isLoading: false,
    error: null,
    isUpdating: false,

    // Member Actions
    getMembers: async (orgId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await http.get(`/organizations/${orgId}/members`);
            const { data } = response.data;

            set({
                members: data.members || [],
                isLoading: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch members';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    inviteMember: async (orgId, email) => {
        set({ isUpdating: true, error: null });
        try {
            const response = await http.post(`/organizations/${orgId}/invite`, { email });
            const { data } = response.data;

            // Add invitation to pending list if it exists
            const newInvitation = {
                id: data.invitationId,
                email: data.email,
                role: 'member',
                inviter: data.inviterName,
                status: 'pending',
                expiresAt: data.expiresAt,
                invitedAt: new Date().toISOString()
            };

            set({
                pendingInvitations: [newInvitation, ...get().pendingInvitations],
                isUpdating: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send invitation';
            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    acceptInvitation: async (token) => {
        set({ isUpdating: true, error: null });
        try {
            const response = await http.post(`/organizations/invitations/accept`, { token });
            const { data } = response.data;

            set({
                isUpdating: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to accept invitation';
            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    getPendingInvitations: async (orgId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await http.get(`/organizations/${orgId}/invitations`);
            const { data } = response.data;

            set({
                pendingInvitations: data || [],
                isLoading: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch pending invitations';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    removeMember: async (orgId, memberId) => {
        set({ isUpdating: true, error: null });
        try {
            const response = await http.delete(`/organizations/${orgId}/members/${memberId}`);
            const { data } = response.data;

            // Remove member from list
            set({
                members: get().members.filter(member => member.id !== memberId),
                isUpdating: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to remove member';
            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    leaveOrganization: async (orgId) => {
        set({ isUpdating: true, error: null });
        try {
            const response = await http.post(`/organizations/${orgId}/leave`);
            const { data } = response.data;

            // Clear members and invitations for this organization
            set({
                members: [],
                pendingInvitations: [],
                isUpdating: false,
                error: null
            });

            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to leave organization';
            set({ isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    // Helper Methods
    clearMembers: () => set({ members: [], pendingInvitations: [] }),

    clearError: () => set({ error: null }),

    resetMemberStore: () => set({
        members: [],
        pendingInvitations: [],
        isLoading: false,
        error: null,
        isUpdating: false
    }),
}));