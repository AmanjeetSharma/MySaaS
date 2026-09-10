export const formatOrganizationMembers = (org) => {
    return [
        {
            id: org.owner._id,
            name: org.owner.name,
            email: org.owner.email,
            role: "owner",
            joinedAt: org.createdAt
        },
        ...org.members.map(member => ({
            id: member.user._id,
            name: member.user.name,
            email: member.user.email,
            role: member.role,
            joinedAt: member.joinedAt
        }))
    ];
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
    inviter: invite.invitedBy?.name || null,
    inviterEmail: invite.invitedBy?.email || null,
    status: invite.status,
    expiresAt: invite.expiresAt,
    invitedAt: invite.createdAt,
    acceptedAt: invite.acceptedAt || null,
});

export const formatInvitations = (invitations) => {
    return invitations.map(formatInvitation);
};