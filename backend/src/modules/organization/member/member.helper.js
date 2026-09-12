export const formatOrganizationMembers = (org) => {
    return [
        {
            id: org.owner._id,
            name: org.owner.name,
            email: org.owner.email,
            role: "owner",
            avatar: org.owner.avatar?.url || null,
        },
        ...org.members.map(member => ({
            id: member.user._id,
            name: member.user.name,
            email: member.user.email,
            role: member.role,
            avatar: member.user.avatar?.url || null,
        }))
    ];
};


export const formatMemberInfo = ({
    user,
    role,
    joinedAt
}) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar?.url || null,
        timezone: user.settings?.timezone || null,
        phone: user.phone?.number || null,
        createdAt: user.createdAt,
        role,
        joinedAt
    };
};


export const buildInvitationRealtimePayload = ({
    invitation,
    organization,
    invitedBy,
}) => {
    return {
        invitationId: invitation._id,
        organization: {
            id: organization._id,
            name: organization.name,
        },
        role: invitation.role,
        invitedBy: {
            id: invitedBy._id,
            name: invitedBy.name,
        },
        expiresAt: invitation.expiresAt,
    };
};


export const buildMemberJoinedRealtimePayload = ({
    user,
    role,
    joinedAt,
}) => {
    return {
        memberId: user._id,
        name: user.name,
        email: user.email,
        role,
        joinedAt,
    };
};


export const buildMemberRemovedRealtimePayload = ({
    user,
    organizationId,
    organizationName,
}) => {
    return {
        memberId: user._id,
        name: user.name,
        email: user.email,
        organizationId,
        organizationName,
    };
};


export const buildMemberLeftRealtimePayload = ({
    user,
    organizationId,
    organizationName,
}) => {
    return {
        memberId: user._id,
        name: user.name,
        email: user.email,
        organizationId,
        organizationName,
    };
};


export const formatInvitation = (invite) => ({
    id: invite._id,
    organization: invite.organization
        ? {
            id: invite.organization._id,
            name: invite.organization.name,
        }
        : null,
    email: invite.email,
    role: invite.role,
    inviterId: invite.invitedBy?._id || null,
    inviter: invite.invitedBy?.name || null,
    inviterEmail: invite.invitedBy?.email || null,
    status: invite.status,
    expiresAt: invite.expiresAt,
    invitedAt: invite.createdAt,
    acceptedAt: invite.acceptedAt || null,
    declinedAt: invite.declinedAt || null,
    revokedAt: invite.revokedAt || null,
});

export const formatInvitations = (invitations) => {
    return invitations.map(formatInvitation);
};


export const buildInvitationDeclinedRealtimePayload = ({
    invitationId,
    organizationId,
    organizationName,
    user,
}) => {
    return {
        invitationId,
        organizationId,
        organizationName,

        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    };
};