import { ApiError } from "../../utils/ApiError.js";





export const convertToSmallestCurrencyUnit = (amount) => {
    if (!amount || amount <= 0) {
        throw new ApiError(400, "Invalid payment amount.");
    }

    return Math.round(amount * 100);
};





export const generatePaymentReceipt = (bookingId) => {
    return `booking_${bookingId}_${Date.now()}`;
};