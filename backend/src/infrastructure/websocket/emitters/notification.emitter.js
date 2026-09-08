import { getIO } from "../socket.js";
import { getUserRoom } from "../rooms/user.rooms.js";
import { SOCKET_EVENTS } from "../events/socketEventNames.js";
import { logger } from "../../../utils/logger.js";

export const emitNotificationToUser = (userId, notification) => {
    const io = getIO();
    const room = getUserRoom(userId);

    const socketsInRoom = io.sockets.adapter.rooms.get(room);

    logger.info(
        {
            userId,
            room,
            socketCount: socketsInRoom?.size ?? 0,
            socketIds: socketsInRoom
                ? [...socketsInRoom]
                : [],
            notificationId: notification._id,
        },
        "notification.realtime.emit"
    );

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