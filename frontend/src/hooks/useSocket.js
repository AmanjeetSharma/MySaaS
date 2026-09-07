import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import {
    connect,
    disconnect,
} from "@/lib/socket/socket.client";
import {
    registerSocketHandlers,
    unregisterSocketHandlers,
} from "@/lib/socket/socket.handlers";

export const useSocket = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            disconnect();
            useNotificationStore.getState().clearAll();
            setIsConnected(false);
            return;
        }

        // Connect and register handlers
        const socket = connect();

        const handleConnect = () => {
            setIsConnected(true);
            registerSocketHandlers(socket);
        };

        const handleDisconnect = () => {
            setIsConnected(false);
            unregisterSocketHandlers(socket);
        };

        const handleConnectError = (err) => {
            console.warn("[Socket] Connection error:", err.message);
            setIsConnected(false);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        if (socket.connected) {
            handleConnect();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);

            unregisterSocketHandlers(socket);

            disconnect();
            setIsConnected(false);
        };
    }, [isAuthenticated]);

    return { isConnected };
};
