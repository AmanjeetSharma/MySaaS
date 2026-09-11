import { create } from "zustand";
import { toast } from "sonner";
import { http } from "../api/httpClient";
import { toastIcon } from "../constants/toastIcon.constant";
import { getErrorMessage } from "../utils/crmStore.utils";


const getEntityId = (entity) => (!entity ? null : typeof entity === "string" ? entity : entity._id || entity.id || null);

const isSameId = (left, right) => {
    const leftId = getEntityId(left), rightId = getEntityId(right);
    return !!leftId && !!rightId && leftId.toString() === rightId.toString();
};


export const useMemberStore = create((set, get) => ({
    members: [],
    memberCount: 0,
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
            set({ members: data.members ?? [], memberCount: data.memberCount ?? 0, isLoading: false, error: null });
            return data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to fetch organization members");
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

    acceptInvitation: async (orgId) => {
        if (!orgId) return;
        set({ isUpdating: true, error: null });
        try {
            const response = await http.post(`/members/${orgId}/invitations/accept`, { orgId });
            const data = response.data?.data;
            // Update accepted invitation locally
            set((state) => ({
                myInvitations: state.myInvitations.map((inv) =>
                    isSameId(inv.organization, orgId)
                        ? { ...inv, status: "accepted", acceptedAt: data?.joinedAt ?? new Date().toISOString() }
                        : inv
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

    leaveOrganization: async (orgId) => {
        if (!orgId) return;
        set({ isUpdating: true, error: null });
        try {
            const response = await http.post(`/members/${orgId}/leave`);
            const data = response.data?.data;
            get().removeMemberLocal(get().currentUserId);
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









    // Local state update methods for socket events

    receiveInvitationLocal: (invitation) => {
        if (!invitation) return;
        set((state) => {
            if (state.myInvitations.some((inv) => isSameId(inv, invitation))) return state;
            return { myInvitations: [invitation, ...state.myInvitations] };
        });
    },

    addMemberLocal: (member) => {
        if (!member) return;
        set((state) => {
            if (state.members.some((m) => isSameId(m, member.memberId))) return state;
            return { members: [...state.members, member], memberCount: state.memberCount + 1 };
        });
    },

    removeMemberLocal: (memberId) => {
        if (!memberId) return;
        set((state) => {
            if (!state.members.some((m) => isSameId(m, memberId))) return state;
            return {
                members: state.members.filter((m) => !isSameId(m, memberId)),
                memberCount: Math.max(state.memberCount - 1, 0),
            };
        });
    },

    memberLeftLocal: (memberId) => get().removeMemberLocal(memberId),

    updateInvitationLocal: (invitationId, updates) => {
        if (!invitationId) return;
        const patch = (inv) => (isSameId(inv, invitationId) ? { ...inv, ...updates } : inv);
        set((state) => ({
            myInvitations: state.myInvitations.map(patch),
            organizationInvitations: state.organizationInvitations.map(patch),
        }));
    },







    clearError: () => set({ error: null }),

    resetMemberStore: () =>
        set({
            members: [],
            memberCount: 0,
            myInvitations: [],
            organizationInvitations: [],
            isLoading: false,
            isUpdating: false,
            error: null,
        }),
}));