export const BOOKING_STATUSES = ["PENDING_PAYMENT", "PAYMENT_FAILED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

export const BOOKING_STATUS_TRANSITIONS = {
    PENDING_PAYMENT: [
        "PAYMENT_FAILED",
        "CONFIRMED"
    ],

    CONFIRMED: [
        "COMPLETED",
        "NO_SHOW",
    ],

    COMPLETED: [],

    CANCELLED: [],

    NO_SHOW: [],
};