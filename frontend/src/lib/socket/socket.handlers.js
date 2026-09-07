import { useNotificationStore } from "@/stores/notificationStore";
import { SOCKET_EVENTS } from "./socket.events";

export const registerSocketHandlers = (socket) => {
    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, (notification) => {
        useNotificationStore.getState().addNotification(notification);
    });
};

export const unregisterSocketHandlers = (socket) => {
    socket.off(SOCKET_EVENTS.NOTIFICATION_NEW);
};
