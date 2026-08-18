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


// if value = 5 then 5 minutes from now
export const PAYMENT_HOLD_DURATION_MINUTES = 15; 