import { useNotificationStore } from "@/stores/notificationStore";
import { SOCKET_EVENTS } from "./socket.events";

export const registerSocketHandlers = (socket) => {
    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, (notification) => {
        // console.log("Received new notification:", notification);
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

    // Member socket events
    socket.on(SOCKET_EVENTS.MEMBER_INVITATION_RECEIVED, (invitation) => {
        useMemberStore.getState().receiveInvitationLocal(invitation);
    });

    socket.on(SOCKET_EVENTS.MEMBER_JOINED, (member) => {
        useMemberStore.getState().addMemberLocal(member);
    });

    socket.on(SOCKET_EVENTS.MEMBER_REMOVED, ({ memberId }) => {
        useMemberStore.getState().removeMemberLocal(memberId);
    });

    socket.on(SOCKET_EVENTS.MEMBER_LEFT, ({ memberId }) => {
        useMemberStore.getState().memberLeftLocal(memberId);
    });

    socket.on(SOCKET_EVENTS.MEMBER_INVITATION_DECLINED, ({ invitationId }) => {
        useMemberStore.getState().removeInvitationLocal(invitationId);
    });

};

export const unregisterSocketHandlers = (socket) => {
    socket.off(SOCKET_EVENTS.NOTIFICATION_NEW);
    socket.off(SOCKET_EVENTS.NOTIFICATION_READ);
    socket.off(SOCKET_EVENTS.NOTIFICATION_DELETED);
    socket.off(SOCKET_EVENTS.NOTIFICATIONS_READ_ALL);
    socket.off(SOCKET_EVENTS.NOTIFICATIONS_DELETED_ALL);

    // Member socket events
    socket.off(SOCKET_EVENTS.MEMBER_INVITATION_RECEIVED);
    socket.off(SOCKET_EVENTS.MEMBER_JOINED);
    socket.off(SOCKET_EVENTS.MEMBER_REMOVED);
    socket.off(SOCKET_EVENTS.MEMBER_LEFT);
    socket.off(SOCKET_EVENTS.MEMBER_INVITATION_DECLINED);
};
