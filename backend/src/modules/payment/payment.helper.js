import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";


export const validatePaymentRequest = ({ bookingId }) => {
    if (!bookingId) {
        throw new ApiError(400, "Booking ID is required.");
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        throw new ApiError(400, "Booking ID must be a valid ObjectId.");
    }
};


export const validateBookingForPayment = (booking) => {
    if (!booking) {
        throw new ApiError(404, "Booking not found.");
    }

    if (booking.status !== "PENDING_PAYMENT") {
        throw new ApiError(400, "This booking is not available for payment.");
    }

    if (
        !booking.serviceSnapshot?.price ||
        booking.serviceSnapshot.price <= 0
    ) {
        throw new ApiError(400, "Invalid booking payment amount.");
    }

    if (!booking.serviceSnapshot?.currency) {
        throw new ApiError(400, "Booking currency is missing.");
    }
};