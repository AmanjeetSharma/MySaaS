import { create } from "zustand";
import { toast } from "sonner";
import { http } from "../api/httpClient";
import { toastIcon } from "../constants/toastIcon.constant";
import { getErrorMessage } from "../utils/crmStore.utils";

const getEntityId = (entity) => {
    if (!entity) return null;
    if (typeof entity === "string") return entity;
    return (
        entity._id ||
        entity.id ||
        entity.memberId ||
        entity.invitationId ||
        entity.user?._id ||
        entity.user?.id ||
        null
    );
};

const isSameId = (left, right) => {
    const leftId = getEntityId(left);
    const rightId = getEntityId(right);
    return !!leftId && !!rightId && leftId.toString() === rightId.toString();
};

export const useMemberStore = create((set, get) => ({
    members: [],
    memberCount: 0,
    memberInfo: null,
    myInvitations: [],
    organizationInvitations: [],
    isLoading: false,
    isUpdating: false,
    error: null,

    fetchMembers: async (orgId) => {
        if (!orgId) return;
        set({ isLoading: true, error: null });
        try {
            const response = await http.get(`/members/${orgId}`);
            const data = response.data?.data ?? {};
            set({
                members: data.members ?? [],
                memberCount: data.memberCount ?? 0,
                isLoading: false,
                error: null,
            });
            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to fetch organization members");
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    fetchMemberInfo: async (orgId, memberId) => {
        if (!orgId || !memberId) return;
        set({ isLoading: true, error: null });
        try {
            const response = await http.get(`/members/${orgId}/${memberId}`);
            const data = response.data?.data ?? null;
            set({ memberInfo: data, isLoading: false, error: null });
            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to fetch member information");
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    fetchMyInvitations: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await http.get("/members/invitations");
            const data = response.data?.data ?? [];
            set({ myInvitations: data, isLoading: false, error: null });
            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to fetch your invitations");
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    fetchOrganizationInvitations: async (orgId) => {
        if (!orgId) return;
        set({ isLoading: true, error: null });
        try {
            const response = await http.get(`/members/${orgId}/invitations`);
            const data = response.data?.data ?? [];
            set({ organizationInvitations: data, isLoading: false, error: null });
            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to fetch organization invitations");
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    inviteMember: async (orgId, email) => {
        if (!orgId || !email) return;
        set({ isUpdating: true, error: null });
        try {
            const response = await http.post(`/members/${orgId}/invite`, { email });
            const data = response.data?.data;
            set({ isUpdating: false, error: null });
            toast.success("Invitation sent successfully", { icon: toastIcon("success") });
            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to send invitation");
            set({ isUpdating: false, error: errorMessage });
            toast.error(errorMessage, { icon: toastIcon("error") });
            throw error;
        }
    },

    acceptInvitation: async (invitationId) => {
        if (!invitationId) return;
        set({ isUpdating: true, error: null });
        try {
            const response = await http.post(`/members/invitations/${invitationId}/accept`);
            const data = response.data?.data;
            set((state) => ({
                myInvitations: state.myInvitations.map((invitation) =>
                    isSameId(invitation, invitationId)
                        ? {
                            ...invitation,
                            status: "accepted",
                            acceptedAt: data?.joinedAt ?? new Date().toISOString(),
                        }
                        : invitation
                ),
                isUpdating: false,
                error: null,
            }));
            toast.success("Invitation accepted successfully", { icon: toastIcon("success") });
            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to accept invitation");
            set({ isUpdating: false, error: errorMessage });
            toast.error(errorMessage, { icon: toastIcon("error") });
            throw error;
        }
    },

    declineInvitation: async (invitationId) => {
        if (!invitationId) return;
        set({ isUpdating: true, error: null });
        try {
            const response = await http.post(`/members/invitations/${invitationId}/decline`);
            const data = response.data?.data;
            set((state) => ({
                myInvitations: state.myInvitations.map((invitation) =>
                    isSameId(invitation, invitationId)
                        ? {
                            ...invitation,
                            status: "declined",
                            declinedAt: data?.declinedAt ?? new Date().toISOString(),
                        }
                        : invitation
                ),
                isUpdating: false,
                error: null,
            }));
            toast.success("Invitation declined successfully", { icon: toastIcon("success") });
            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to decline invitation");
            set({ isUpdating: false, error: errorMessage });
            toast.error(errorMessage, { icon: toastIcon("error") });
            throw error;
        }
    },

    removeMember: async (orgId, memberId) => {
        if (!orgId || !memberId) return;
        set({ isUpdating: true, error: null });
        try {
            const response = await http.delete(`/members/${orgId}/${memberId}`);
            const data = response.data?.data;
            get().removeMemberLocal(memberId);
            set({ isUpdating: false, error: null });
            toast.success("Member removed successfully", { icon: toastIcon("success") });
            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to remove member");
            set({ isUpdating: false, error: errorMessage });
            toast.error(errorMessage, { icon: toastIcon("error") });
            throw error;
        }
    },

    leaveOrganization: async (orgId, userId) => {
        if (!orgId || !userId) return;
        set({ isUpdating: true, error: null });
        try {
            const response = await http.post(`/members/${orgId}/leave`);
            const data = response.data?.data;
            get().removeMemberLocal(userId);
            set({ isUpdating: false, error: null });
            toast.success("You left the organization successfully", { icon: toastIcon("success") });
            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to leave organization");
            set({ isUpdating: false, error: errorMessage });
            toast.error(errorMessage, { icon: toastIcon("error") });
            throw error;
        }
    },

    // Socket Local Updates
    receiveInvitationLocal: (invitation) => {
        if (!invitation) return;
        set((state) => {
            if (state.myInvitations.some((inv) => isSameId(inv, invitation))) return state;
            return { myInvitations: [invitation, ...state.myInvitations] };
        });
    },

    addMemberLocal: (member) => {
        if (!member) return;

        // Normalize backend socket payload vs API object structure
        const normalizedMember = member.user
            ? {
                id: member.user._id || member.user.id,
                name: member.user.name,
                email: member.user.email,
                avatar: member.user.avatar,
                role: member.role,
                joinedAt: member.joinedAt || new Date().toISOString(),
            }
            : member;

        set((state) => {
            if (state.members.some((existing) => isSameId(existing, normalizedMember))) {
                return state;
            }
            return {
                members: [...state.members, normalizedMember],
                memberCount: state.memberCount + 1,
            };
        });
    },

    removeMemberLocal: (memberId) => {
        if (!memberId) return;
        set((state) => {
            if (!state.members.some((member) => isSameId(member, memberId))) return state;
            return {
                members: state.members.filter((member) => !isSameId(member, memberId)),
                memberCount: Math.max(state.memberCount - 1, 0),
            };
        });
    },

    memberLeftLocal: (memberId) => {
        get().removeMemberLocal(memberId);
    },

    removeInvitationLocal: (invitationId) => {
        if (!invitationId) return;
        set((state) => ({
            myInvitations: state.myInvitations.filter((inv) => !isSameId(inv, invitationId)),
            organizationInvitations: state.organizationInvitations.filter(
                (inv) => !isSameId(inv, invitationId)
            ),
        }));
    },

    updateInvitationLocal: (invitationId, updates) => {
        if (!invitationId) return;
        const patch = (invitation) =>
            isSameId(invitation, invitationId) ? { ...invitation, ...updates } : invitation;

        set((state) => ({
            myInvitations: state.myInvitations.map(patch),
            organizationInvitations: state.organizationInvitations.map(patch),
        }));
    },

    clearError: () => set({ error: null }),

    clearMemberInfo: () => set({ memberInfo: null }),

    resetMemberStore: () =>
        set({
            members: [],
            memberCount: 0,
            memberInfo: null,
            myInvitations: [],
            organizationInvitations: [],
            isLoading: false,
            isUpdating: false,
            error: null,
        }),
}));