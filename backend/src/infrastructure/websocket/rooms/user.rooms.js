export const getUserRoom = (userId) => {
    return `user:${userId}`;
};

export const joinUserRoom = (socket) => {
    const room = getUserRoom(socket.user._id.toString());

    socket.join(room);

    return room;
};

export const leaveUserRoom = (socket) => {
    const room = getUserRoom(socket.user._id.toString());

    socket.leave(room);

    return room;
};