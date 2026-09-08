import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { connect, disconnect } from "@/lib/socket/socket.client";
import { registerSocketHandlers, unregisterSocketHandlers } from "@/lib/socket/socket.handlers";

/**
 * Manages the Socket.IO connection lifecycle.
 *
 * Key design decisions:
 * - The socket is created once when the user authenticates and kept alive
 *   until they log out. It is NOT torn down on component unmount/remount
 *   (which would happen in React StrictMode or during navigation).
 * - Domain event handlers (notification:new, etc.) are registered once on
 *   `connect` and removed only on `disconnect` or logout.
 * - On logout (isAuthenticated → false), the socket is fully disconnected
 *   and the notification store is cleared.
 */
export const useSocket = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            // User logged out — tear everything down
            disconnect();
            useNotificationStore.getState().clearAll();
            setIsConnected(false);
            return;
        }

        // Connect (idempotent — safe to call if already connected)
        const socket = connect();

        const handleConnect = () => {
            setIsConnected(true);
            // Remove any stale listeners before re-registering to prevent duplicates
            unregisterSocketHandlers(socket);
            registerSocketHandlers(socket);
        };

        const handleDisconnect = () => {
            setIsConnected(false);
        };

        const handleConnectError = (err) => {
            console.warn("[Socket] Connection error:", err.message);
            setIsConnected(false);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        // If the socket is already connected when this effect runs
        // (e.g. React StrictMode double-invoke, or hot reload), wire up immediately.
        if (socket.connected) {
            handleConnect();
        }

        // Cleanup: only remove the lifecycle listeners added in this effect.
        // Do NOT disconnect the socket here — the socket must remain alive
        // across re-renders and navigation for real-time updates to keep working.
        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
        };
    }, [isAuthenticated]);

    return { isConnected };
};
