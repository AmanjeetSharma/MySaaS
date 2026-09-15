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

const INITIAL_PAGINATION_STATE = {
    invitations: [],
    nextCursor: null,
    hasNextPage: false,
};

// Helper to update invitation items inside array or paginated object envelope
const updateInvitationInState = (target, invitationId, patchFn) => {
    if (Array.isArray(target)) {
        return target.map((inv) => (isSameId(inv, invitationId) ? patchFn(inv) : inv));
    }
    return {
        ...target,
        invitations: (target?.invitations || []).map((inv) =>
            isSameId(inv, invitationId) ? patchFn(inv) : inv
        ),
    };
};

// Helper to filter out invitations inside array or paginated object envelope
const filterInvitationInState = (target, invitationId) => {
    if (Array.isArray(target)) {
        return target.filter((inv) => !isSameId(inv, invitationId));
    }
    return {
        ...target,
        invitations: (target?.invitations || []).filter((inv) => !isSameId(inv, invitationId)),
    };
};

export const useMemberStore = create((set, get) => ({
    members: [],
    memberCount: 0,
    memberInfo: null,
    myInvitations: { ...INITIAL_PAGINATION_STATE },
    organizationInvitations: { ...INITIAL_PAGINATION_STATE },
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

    fetchMyInvitations: async ({ cursor = null, limit = 10, append = false } = {}) => {
        set({ isLoading: !append, isUpdating: append, error: null });
        try {
            const response = await http.get("/members/invitations", {
                params: {
                    ...(cursor ? { cursor } : {}),
                    ...(limit ? { limit } : {}),
                },
            });

            const data = response.data?.data ?? {};
            const newInvitations = data.invitations ?? (Array.isArray(data) ? data : []);
            const nextCursor = data.nextCursor ?? null;
            const hasNextPage = Boolean(data.hasNextPage);

            set((state) => {
                const existingList = state.myInvitations?.invitations || [];
                const mergedInvitations = append
                    ? [
                          ...existingList,
                          ...newInvitations.filter(
                              (newItem) => !existingList.some((old) => isSameId(old, newItem))
                          ),
                      ]
                    : newInvitations;

                return {
                    myInvitations: {
                        invitations: mergedInvitations,
                        nextCursor,
                        hasNextPage,
                    },
                    isLoading: false,
                    isUpdating: false,
                    error: null,
                };
            });

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to fetch your invitations");
            set({ isLoading: false, isUpdating: false, error: errorMessage });
            throw error;
        }
    },

    fetchOrganizationInvitations: async (orgId, { cursor = null, limit = 10, append = false } = {}) => {
        if (!orgId) return;
        set({ isLoading: !append, isUpdating: append, error: null });
        try {
            const response = await http.get(`/members/${orgId}/invitations`, {
                params: {
                    ...(cursor ? { cursor } : {}),
                    ...(limit ? { limit } : {}),
                },
            });

            const data = response.data?.data ?? {};
            const newInvitations = data.invitations ?? (Array.isArray(data) ? data : []);
            const nextCursor = data.nextCursor ?? null;
            const hasNextPage = Boolean(data.hasNextPage);

            set((state) => {
                const existingList = state.organizationInvitations?.invitations || [];
                const mergedInvitations = append
                    ? [
                          ...existingList,
                          ...newInvitations.filter(
                              (newItem) => !existingList.some((old) => isSameId(old, newItem))
                          ),
                      ]
                    : newInvitations;

                return {
                    organizationInvitations: {
                        invitations: mergedInvitations,
                        nextCursor,
                        hasNextPage,
                    },
                    isLoading: false,
                    isUpdating: false,
                    error: null,
                };
            });

            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to fetch organization invitations");
            set({ isLoading: false, isUpdating: false, error: errorMessage });
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
                myInvitations: updateInvitationInState(state.myInvitations, invitationId, (invitation) => ({
                    ...invitation,
                    status: "accepted",
                    acceptedAt: data?.joinedAt ?? new Date().toISOString(),
                })),
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
                myInvitations: updateInvitationInState(state.myInvitations, invitationId, (invitation) => ({
                    ...invitation,
                    status: "declined",
                    declinedAt: data?.declinedAt ?? new Date().toISOString(),
                })),
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

    revokeInvitation: async (orgId, invitationId) => {
        if (!orgId || !invitationId) return;
        set({ isUpdating: true, error: null });
        try {
            const response = await http.post(`/members/${orgId}/${invitationId}/revoke`);
            const data = response.data?.data;

            set((state) => ({
                organizationInvitations: updateInvitationInState(
                    state.organizationInvitations,
                    invitationId,
                    (invitation) => ({
                        ...invitation,
                        status: "revoked",
                        revokedAt: data?.revokedAt ?? new Date().toISOString(),
                    })
                ),
                isUpdating: false,
                error: null,
            }));

            toast.success("Invitation revoked successfully", { icon: toastIcon("success") });
            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to revoke invitation");
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
            const currentList = state.myInvitations?.invitations || [];
            if (currentList.some((inv) => isSameId(inv, invitation))) return state;
            return {
                myInvitations: {
                    ...state.myInvitations,
                    invitations: [invitation, ...currentList],
                },
            };
        });
    },

    addMemberLocal: (member) => {
        if (!member) return;

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
            myInvitations: filterInvitationInState(state.myInvitations, invitationId),
            organizationInvitations: filterInvitationInState(state.organizationInvitations, invitationId),
        }));
    },

    updateInvitationLocal: (invitationId, updates) => {
        if (!invitationId) return;
        set((state) => ({
            myInvitations: updateInvitationInState(state.myInvitations, invitationId, (inv) => ({
                ...inv,
                ...updates,
            })),
            organizationInvitations: updateInvitationInState(
                state.organizationInvitations,
                invitationId,
                (inv) => ({ ...inv, ...updates })
            ),
        }));
    },

    clearError: () => set({ error: null }),

    clearMemberInfo: () => set({ memberInfo: null }),

    resetMemberStore: () =>
        set({
            members: [],
            memberCount: 0,
            memberInfo: null,
            myInvitations: { ...INITIAL_PAGINATION_STATE },
            organizationInvitations: { ...INITIAL_PAGINATION_STATE },
            isLoading: false,
            isUpdating: false,
            error: null,
        }),
}));