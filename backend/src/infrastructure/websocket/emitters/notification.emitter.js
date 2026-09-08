import { getIO } from "../socket.js";
import { getUserRoom } from "../rooms/user.rooms.js";
import { SOCKET_EVENTS } from "../events/socketEventNames.js";

export const emitNotificationToUser = (userId, notification) => {
    const io = getIO();
    const room = getUserRoom(userId);

    io.to(room).emit(SOCKET_EVENTS.NOTIFICATION_NEW, notification);
};


export const emitNotificationsRead = (userId, notificationIds) => {
    const io = getIO();
    const room = getUserRoom(userId);

    io.to(room).emit(SOCKET_EVENTS.NOTIFICATION_READ, {
        notificationIds,
    });
};


export const emitNotificationsDeleted = (userId, notificationIds) => {
    const io = getIO();
    const room = getUserRoom(userId);

    io.to(room).emit(SOCKET_EVENTS.NOTIFICATION_DELETED, {
        notificationIds,
    });
};


export const emitAllNotificationsRead = (userId) => {
    const io = getIO();
    const room = getUserRoom(userId);

    io.to(room).emit(SOCKET_EVENTS.NOTIFICATIONS_READ_ALL);
};


export const emitAllNotificationsDeleted = (userId) => {
    const io = getIO();
    const room = getUserRoom(userId);

    io.to(room).emit(SOCKET_EVENTS.NOTIFICATIONS_DELETED_ALL);
};