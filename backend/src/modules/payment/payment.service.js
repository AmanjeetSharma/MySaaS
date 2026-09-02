import { ApiError } from "../../utils/ApiError.js";
import {
    createPendingBookingService,
    confirmBookingService,
} from "../booking/booking.service.js";
import {
    createRazorpayOrder,
    verifyRazorpayPaymentSignature,
    verifyRazorpayWebhookSignature,
} from "../../integrations/razorpay.integration.js";
import {
    createPayment,
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

    console.log(`[Payment] Payment session created for booking ID: ${booking._id}, payment ID: ${payment._id}, Razorpay order ID: ${razorpayOrder.id}`);

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









const processSuccessfulPayment = async ({
    razorpayOrderId,
    razorpayPaymentId,
}) => {

    const payment = await findPaymentByRazorpayOrderId(razorpayOrderId);
    if (!payment) {
        throw new ApiError(404, "Payment record not found.");
    }

    if (payment.status === "SUCCESS") {
        return {
            paymentId: payment._id,
            bookingId: payment.booking,
            status: "SUCCESS",
            alreadyProcessed: true,
            bookingStatus: "CONFIRMED",
        };
    }

    if (payment.status !== "CREATED") {
        throw new ApiError(409, "This payment is no longer available for processing.");
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

    console.log(`[Payment] Payment successful for booking ID: ${booking._id}, payment ID: ${updatedPayment._id}`);

    return {
        paymentId: updatedPayment._id,
        bookingId: booking._id,
        status: "SUCCESS",
        bookingStatus: booking.status,
        meetingLink: booking.meeting?.link ?? null,
        alreadyProcessed: false,
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

    const isValidSignature = verifyRazorpayPaymentSignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
    });
    if (!isValidSignature) {
        throw new ApiError(400, "Invalid payment signature.");
    }

    console.log(`[Payment] Payment verified successfully. Order: ${razorpayOrderId}, Payment: ${razorpayPaymentId}`);

    return processSuccessfulPayment({
        razorpayOrderId,
        razorpayPaymentId,
    });
};










export const handleRazorpayWebhookService = async ({
    payload,
    signature,
}) => {

    if (!signature) {
        throw new ApiError(400, "Razorpay webhook signature is missing.");
    }

    const isValidSignature = verifyRazorpayWebhookSignature({
        payload,
        signature,
    });
    if (!isValidSignature) {
        throw new ApiError(400, "Invalid Razorpay webhook signature.");
    }

    const parsedPayload = Buffer.isBuffer(payload)
        ? payload.toString("utf8")
        : payload;

    let webhookEvent;

    try {
        webhookEvent = typeof parsedPayload === "string" ? JSON.parse(parsedPayload) : parsedPayload;
    } catch (error) {
        throw new ApiError(400, "Invalid Razorpay webhook payload.");
    }


    // Extracting event
    const event = webhookEvent?.event;
    console.log("[Razorpay Webhook] Event:", event);
    if (!event) {
        throw new ApiError(400, "Razorpay webhook event is missing.");
    }

    if (event === "payment.captured") {

        const paymentEntity = webhookEvent?.payload?.payment?.entity;

        if (!paymentEntity?.order_id || !paymentEntity?.id) {
            throw new ApiError(400, "Razorpay payment details are missing from webhook.");
        }

        console.log(`[Razorpay Webhook] Payment captured successfully. Order: ${paymentEntity.order_id}, Payment: ${paymentEntity.id}`);

        return await processSuccessfulPayment({
            razorpayOrderId: paymentEntity.order_id,
            razorpayPaymentId: paymentEntity.id,
        });
    }

    if (event === "payment.failed") {

        const paymentEntity = webhookEvent?.payload?.payment?.entity;

        console.log(
            `[Razorpay Webhook] Payment attempt failed.` +
            ` Order: ${paymentEntity?.order_id || "unknown"}` +
            ` Payment: ${paymentEntity?.id || "unknown"}`
        );

        console.log(`Reason: ${paymentEntity?.error_reason || "unknown"}` + ` Description: ${paymentEntity?.error_description || "No description provided."}`);

        return {
            event,
            handled: true,
            paymentAttemptFailed: true,
            paymentFailureDetails: {
                razorpayOrderId: paymentEntity?.order_id || null,
                razorpayPaymentId: paymentEntity?.id || null,
                reason: paymentEntity?.error_reason || "unknown",
                description: paymentEntity?.error_description || "No description provided.",
            },
        };
    }

    console.log(`[Razorpay Webhook] Unhandled event type: ${event}. No action taken.`);

    return {
        event,
        handled: false,
    };
};