import { Server } from "socket.io";
import { socketConfig } from "./config/socket.config.js";
import { socketAuth } from "./middleware/socketAuth.middleware.js";
import { handleConnection } from "./handlers/connection.handler.js";

let io;

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, socketConfig);

    io.use(socketAuth);

    io.on("connection", handleConnection);

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
};