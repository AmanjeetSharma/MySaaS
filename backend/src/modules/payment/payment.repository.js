import { Payment } from "./payment.model.js";

export const createPayment = async (paymentData) => {
    return Payment.create(paymentData);
};


export const findPaymentByRazorpayOrderId = async (razorpayOrderId) => {
    return Payment.findOne({
        razorpayOrderId,
    });
};


export const findPaymentByBookingId = async (bookingId) => {
    return Payment.findOne({
        booking: bookingId,
    });
};


export const markPaymentAsSuccess = async ({
    paymentId,
    razorpayPaymentId,
}) => {
    return Payment.findOneAndUpdate(
        {
            _id: paymentId,
            status: "CREATED",
        },
        {
            $set: {
                status: "SUCCESS",
                razorpayPaymentId,
                paidAt: new Date(),
            },
        },
        {
            returnDocument: "after",
            runValidators: true,
        }
    );
};
