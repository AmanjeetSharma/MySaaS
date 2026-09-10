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
