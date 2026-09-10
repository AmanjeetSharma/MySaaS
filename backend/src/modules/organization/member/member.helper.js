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