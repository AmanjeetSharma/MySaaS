export const SOCKET_EVENTS = {
    //NOTIFICATION EVENTS
    NOTIFICATION_NEW: "notification:new",
    NOTIFICATION_READ: "notification:read",
    NOTIFICATION_DELETED: "notification:deleted",
    NOTIFICATIONS_READ_ALL: "notifications:read-all",
    NOTIFICATIONS_DELETED_ALL: "notifications:deleted-all",

    //BOOKING EVENTS
    BOOKING_NEW: "booking:new",
    BOOKING_UPDATED: "booking:updated",
    BOOKING_STATUS_CHANGED: "booking:status-changed",
    BOOKING_RESCHEDULED: "booking:rescheduled",
    BOOKING_CANCELLED: "booking:cancelled",

    //MEMBER EVENTS
    MEMBER_INVITATION_RECEIVED: "member:invitation-received",
    MEMBER_JOINED: "member:joined",
    MEMBER_REMOVED: "member:removed",
    MEMBER_LEFT: "member:left",
};