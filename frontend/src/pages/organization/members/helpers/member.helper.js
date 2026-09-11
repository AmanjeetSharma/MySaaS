export const getEntityId = (entity) => {
    if (!entity) return null;
    if (typeof entity === "string") return entity;
    return (
        entity.id ||
        entity._id ||
        entity.memberId ||
        entity.invitationId ||
        entity.user?.id ||
        entity.user?._id ||
        null
    );
};

export const isSameId = (left, right) => {
    const leftId = getEntityId(left);
    const rightId = getEntityId(right);
    return !!leftId && !!rightId && leftId.toString() === rightId.toString();
};

export const checkIsOwner = (org, user) => {
    if (!org || !user) return false;
    const ownerId = getEntityId(org.owner) || getEntityId(org.ownerId);
    const currentUserId = getEntityId(user);
    return isSameId(ownerId, currentUserId);
};

export const formatDate = (isoString) => {
    if (!isoString) return "-";
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(isoString));
};

export const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
        case "accepted":
            return "default";
        case "pending":
            return "secondary";
        case "expired":
            return "destructive";
        default:
            return "outline";
    }
};