import { useNotificationStore } from "@/stores/notificationStore";
import { SOCKET_EVENTS } from "./socket.events";

export const registerSocketHandlers = (socket) => {
    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, (notification) => {
        useNotificationStore.getState().receiveNotification(notification);
    });

    socket.on(SOCKET_EVENTS.NOTIFICATION_READ, ({ notificationIds }) => {
        useNotificationStore.getState().markSelectedReadLocal(notificationIds);
    });

    socket.on(SOCKET_EVENTS.NOTIFICATIONS_READ_ALL, () => {
        useNotificationStore.getState().markAllReadLocal();
    });

    socket.on(SOCKET_EVENTS.NOTIFICATION_DELETED, ({ notificationIds }) => {
        useNotificationStore.getState().deleteSelectedLocal(notificationIds);
    });

    socket.on(SOCKET_EVENTS.NOTIFICATIONS_DELETED_ALL, () => {
        useNotificationStore.getState().deleteAllLocal();
    });
};

export const unregisterSocketHandlers = (socket) => {
    socket.off(SOCKET_EVENTS.NOTIFICATION_NEW);
    socket.off(SOCKET_EVENTS.NOTIFICATION_READ);
    socket.off(SOCKET_EVENTS.NOTIFICATION_DELETED);
    socket.off(SOCKET_EVENTS.NOTIFICATIONS_READ_ALL);
    socket.off(SOCKET_EVENTS.NOTIFICATIONS_DELETED_ALL);
};
