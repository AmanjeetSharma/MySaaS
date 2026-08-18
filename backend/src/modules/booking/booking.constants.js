export const BOOKING_STATUSES = ["PENDING_PAYMENT", "PAYMENT_FAILED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW", "EXPIRED"];

export const BOOKING_STATUS_TRANSITIONS = {
    PENDING_PAYMENT: [
        "PAYMENT_FAILED",
        "CONFIRMED",
        "EXPIRED"
    ],

    CONFIRMED: [
        "COMPLETED",
        "NO_SHOW",
    ],

    COMPLETED: [],

    CANCELLED: [],

    NO_SHOW: [],

    EXPIRED: [],

};