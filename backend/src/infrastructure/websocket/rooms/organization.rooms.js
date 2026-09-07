export const getOrganizationRoom = (organizationId) => {
    return `organization:${organizationId}`;
};

export const joinOrganizationRoom = (socket, organizationId) => {
    const room = getOrganizationRoom(organizationId);

    socket.join(room);

    return room;
};

export const leaveOrganizationRoom = (socket, organizationId) => {
    const room = getOrganizationRoom(organizationId);

    socket.leave(room);

    return room;
};