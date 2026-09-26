export const buildUserProfile = (user) => {
    const { sessions, __v, ...profile } = user.toObject();

    return {
        _id: profile._id,
        avatar: profile.avatar,
        name: profile.name,
        email: profile.email,
        providers: profile.providers,
        accountStatus: profile.accountStatus,
        settings: profile.settings,
        phone: profile.phone,
        activeOrganization: profile.activeOrganization,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
    };
}