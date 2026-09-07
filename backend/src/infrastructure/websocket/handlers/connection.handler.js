import logger from "#/config/logger.js";
import { joinUserRoom } from "../rooms/user.rooms.js";
import { registerSocketEvents } from "../events/socketEventRegistry.js";

export const handleConnection = (socket) => {
    const userRoom = joinUserRoom(socket);

    logger.info(
        {
            socketId: socket.id,
            userId: socket.user._id,
            room: userRoom,
        },
        "Websocket connection established"
    );

    registerSocketEvents(socket);

    socket.on("disconnect", (reason) => {
        logger.info(
            {
                socketId: socket.id,
                userId: socket.user._id,
                reason,
            },
            "Websocket connection closed"
        );
    });
};