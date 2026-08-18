import { ApiError } from "../../utils/ApiError.js";
import {
    createPendingBookingService,
    confirmBookingService,
} from "../booking/booking.service.js";
import {
    createRazorpayOrder,
    verifyRazorpayPaymentSignature,
} from "../../integrations/razorpay.integration.js";
import {
    createPayment,
    updateBookingStatus,
    findPaymentByRazorpayOrderId,
    markPaymentAsSuccess,
    findPaymentByBookingId,
} from "./payment.repository.js";
import {
    convertToSmallestCurrencyUnit,
    generatePaymentReceipt,

} from "./payment.helper.js";
import env from "../../config/env.config.js";











export const createPaymentService = async (payload = {}) => {

    // create pending booking 
    const {
        booking,
        bookingId,
        amount,
        currency,
        paymentExpiresAt,
        isExisting,
    } = await createPendingBookingService(payload);

    if (isExisting) {
        const existingPayment = await findPaymentByBookingId(
            bookingId
        );

        if (!existingPayment) {
            throw new ApiError(500, "Existing booking payment session could not be found.");
        }

        if (existingPayment.status === "SUCCESS") {
            throw new ApiError(409, "This booking has already been confirmed.");
        }

        return {
            bookingId: booking._id,
            paymentId: existingPayment._id,
            razorpayOrderId: existingPayment.razorpayOrderId,
            amount: existingPayment.amount,
            currency: existingPayment.currency,
            keyId: env.RAZORPAY_KEY_ID,
            paymentExpiresAt,
        };
    }

    const razorpayAmount = convertToSmallestCurrencyUnit(amount);

    const receipt = generatePaymentReceipt(bookingId);


    let razorpayOrder;

    try {
        razorpayOrder = await createRazorpayOrder({
            amount: razorpayAmount,
            currency,
            receipt,
        });

    } catch (error) {

        console.error("[Payment] Failed to create Razorpay order:", error?.error?.description || error.message);
        // Booking was created but payment initialization failed.
        throw new ApiError(502, "Unable to initialize payment. Please try again.");
    }

    let payment;

    try {
        payment = await createPayment({
            organization: booking.organization,
            booking: booking._id,
            provider: "RAZORPAY",
            amount: razorpayAmount,
            currency,
            status: "CREATED",
            razorpayOrderId: razorpayOrder.id,
        });

    } catch (error) {
        console.error("[Payment] Failed to create payment record for booking ID:", booking._id, "-", error.message);
        throw new ApiError(500, "Unable to initialize payment. Please try again.");
    }

    booking.payment = payment._id;
    await booking.save();

    return {
        bookingId: booking._id,
        paymentId: payment._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayAmount,
        currency,
        keyId: env.RAZORPAY_KEY_ID,
        paymentExpiresAt,
    };
};











export const verifyPaymentService = async ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
}) => {

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new ApiError(400, "Razorpay payment details are required.");
    }

    const payment = await findPaymentByRazorpayOrderId(razorpayOrderId);
    if (!payment) {
        throw new ApiError(404, "Payment record not found.");
    }

    // Idempotency check
    if (payment.status === "SUCCESS") {
        return {
            paymentId: payment._id,
            bookingId: payment.booking,
            status: "SUCCESS",
            alreadyProcessed: true,
        };
    }


    const isValidSignature = verifyRazorpayPaymentSignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
    });
    if (!isValidSignature) {
        throw new ApiError(400, "Invalid payment signature.");
    }

    const updatedPayment = await markPaymentAsSuccess({
        paymentId: payment._id,
        razorpayPaymentId,
    });
    if (!updatedPayment) {
        throw new ApiError(409, "Payment could not be completed.");
    }

    const booking = await confirmBookingService({
        bookingId: payment.booking,
    });

    return {
        paymentId: updatedPayment._id,
        bookingId: booking._id,
        status: "SUCCESS",
        bookingStatus: booking.status,
        meetingLink: booking.meeting?.link ?? null,
    };
};