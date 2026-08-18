import { Payment } from "./payment.model.js";

export const createPayment = async (paymentData) => {
    return Payment.create(paymentData);
};


export const updateBookingStatus = async (bookingId, orgId, status, updateData = {}) => {
    return Booking.findOneAndUpdate(
        {
            _id: bookingId,
            organization: orgId,
        },
        {
            $set: {
                status,
                ...updateData,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );
};


export const findPaymentByRazorpayOrderId = async (razorpayOrderId) => {
    return Payment.findOne({
        razorpayOrderId,
    });
};


export const markPaymentAsSuccess = async ({
    paymentId,
    razorpayPaymentId,
}) => {
    return Payment.findOneAndUpdate(
        {
            _id: paymentId,
            status: {
                $ne: "SUCCESS",
            },
        },
        {
            $set: {
                status: "SUCCESS",
                razorpayPaymentId,
                paidAt: new Date(),
                failureReason: null,
                failedAt: null,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );
};


export const markPaymentAsFailed = async ({
    paymentId,
    failureReason,
}) => {
    return Payment.findOneAndUpdate(
        {
            _id: paymentId,
            status: {
                $nin: ["SUCCESS"],
            },
        },
        {
            $set: {
                status: "FAILED",
                failureReason: failureReason || null,
                failedAt: new Date(),
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );
};