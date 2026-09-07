import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL

let socket = null;

export const connect = () => {
    if (socket?.connected) return socket;

    if (!socket) {
        socket = io(SOCKET_URL, {
            withCredentials: true,   // send the accessToken cookie
            autoConnect: false,   
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });
    }

    socket.connect();
    return socket;
};


export const disconnect = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};


export const getSocket = () => {
    if (!socket) {
        throw new Error("Socket has not been initialised. Please call connect() first.");
    }
    return socket;
};
