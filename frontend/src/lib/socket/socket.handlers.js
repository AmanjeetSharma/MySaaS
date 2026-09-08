import { useNotificationStore } from "@/stores/notificationStore";
import { SOCKET_EVENTS } from "./socket.events";

/**
 * Registers all inbound socket event handlers on the given socket instance.
 * Mirrors the backend's registerSocketEvents() pattern.
 *
 * Add new event handlers here as the backend grows.
 *
 * @param {import("socket.io-client").Socket} socket
 */
export const registerSocketHandlers = (socket) => {
    // ── Notification handlers ─────────────────────────────────────────────
    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, (notification) => {
        useNotificationStore.getState().receiveNotification(notification);
    });
};

/**
 * Removes all inbound socket event handlers registered by registerSocketHandlers.
 * Called on disconnect / cleanup to avoid duplicate listeners on reconnect.
 *
 * @param {import("socket.io-client").Socket} socket
 */
export const unregisterSocketHandlers = (socket) => {
    socket.off(SOCKET_EVENTS.NOTIFICATION_NEW);
};
