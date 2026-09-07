import { getIO } from "../socket.js";
import { getUserRoom } from "../rooms/user.rooms.js";
import { SOCKET_EVENTS } from "../events/socketEventNames.js";

export const emitNotificationToUser = (userId, notification) => {
    const io = getIO();
    const room = getUserRoom(userId);

    io.to(room).emit(SOCKET_EVENTS.NOTIFICATION_NEW, notification);
};