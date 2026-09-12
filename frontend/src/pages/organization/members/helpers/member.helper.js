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

export const getInitials = (name = "") => {
    if (!name) return "U";
    return name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
};

export const formatDate = (isoString) => {
    if (!isoString) return "-";
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: userTimeZone,
    }).format(new Date(isoString));
};

export const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: userTimeZone,
    }).format(new Date(isoString));
};

export const formatExpiryDetails = (isoString) => {
    if (!isoString) return { formatted: "-", isExpired: false, relative: "" };

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const target = new Date(isoString);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const isExpired = diffMs <= 0;

    const formatted = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: userTimeZone,
    }).format(target);

    if (isExpired) {
        return { formatted, isExpired: true, relative: "Expired" };
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    let relative = "";
    if (days > 0) {
        relative = `in ${days}d ${hours % 24}h`;
    } else if (hours > 0) {
        relative = `in ${hours}h`;
    } else {
        const minutes = Math.max(Math.floor(diffMs / (1000 * 60)), 1);
        relative = `in ${minutes}m`;
    }

    return { formatted, isExpired: false, relative };
};