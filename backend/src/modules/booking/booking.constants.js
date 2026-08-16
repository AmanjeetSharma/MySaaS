export const BOOKING_STATUSES = ["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

export const BOOKING_STATUS_TRANSITIONS = {
    CONFIRMED: [
        "COMPLETED",
        "NO_SHOW",
    ],

    COMPLETED: [],

    CANCELLED: [],

    NO_SHOW: [],
};