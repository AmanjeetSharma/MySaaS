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
import env from "#/config/env.config.js";
import logger from "#/config/logger.js";








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
        logger.error(
            {
                error: error?.error?.description || error.message,
            },
            "payment.razorpay_order_creation_failed"
        );

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
        logger.error(
            {
                bookingId: booking._id,
                error: error.message,
            },
            "payment.record_creation_failed"
        );

        throw new ApiError(500, "Unable to initialize payment. Please try again.");
    }

    booking.payment = payment._id;
    await booking.save();

    logger.info(
        {
            bookingId: booking._id,
            paymentId: payment._id,
            razorpayOrderId: razorpayOrder.id,
        },
        "payment.session_created"
    );

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
        logger.info(
            {
                bookingId: payment.booking,
                paymentId: payment._id,
            },
            "payment.already_processed_by_razorpay_webhook"
        );
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


    logger.info(
        {
            bookingId: booking._id,
            paymentId: updatedPayment._id,
            razorpayPaymentId,
        },
        "payment.successfully_processed"
    );

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

    logger.info(
        {
            razorpayOrderId,
            razorpayPaymentId,
        },
        "payment.verified_successfully"
    );

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

    logger.info(
        {
            event,
        },
        "payment.razorpay_webhook_received"
    );

    if (!event) {
        throw new ApiError(400, "Razorpay webhook event is missing.");
    }

    if (event === "payment.captured") {

        const paymentEntity = webhookEvent?.payload?.payment?.entity;

        if (!paymentEntity?.order_id || !paymentEntity?.id) {
            throw new ApiError(400, "Razorpay payment details are missing from webhook.");
        }

        logger.info(
            {
                razorpayOrderId: paymentEntity.order_id,
                razorpayPaymentId: paymentEntity.id,
            },
            "payment.captured_by_razorpay_webhook"
        );

        return await processSuccessfulPayment({
            razorpayOrderId: paymentEntity.order_id,
            razorpayPaymentId: paymentEntity.id,
        });
    }

    if (event === "payment.failed") {

        const paymentEntity = webhookEvent?.payload?.payment?.entity;

        logger.info(
            {
                razorpayOrderId: paymentEntity?.order_id || null,
                razorpayPaymentId: paymentEntity?.id || null,
                reason: paymentEntity?.error_reason || null,
                description: paymentEntity?.error_description || null,
            },
            "payment.failure_verified_by_razorpay_webhook"
        );

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

    logger.info(
        {
            event,
        },
        "payment.unhandled_event.no_action_taken"
    );

    return {
        event,
        handled: false,
    };
};