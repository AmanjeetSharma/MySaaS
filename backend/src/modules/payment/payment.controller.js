import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    createPaymentService,
    verifyPaymentService,
    handleRazorpayWebhookService,
} from "./payment.service.js";


export const createPaymentController = asyncHandler(async (req, res) => {
    const { organizationSlug, serviceSlug, startTime, booker, notes } = req.body;

    const data = await createPaymentService({
        organizationSlug,
        serviceSlug,
        startTime,
        booker,
        notes
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            data,
            "Payment order created successfully."
        )
    );
});


export const verifyPaymentController = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    } = req.body;

    const data = await verifyPaymentService({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Payment verified successfully."
        )
    );
});


export const handleRazorpayWebhookController = asyncHandler(async (req, res) => {
    console.log("[Razorpay Webhook] Event Initiated:");
    await handleRazorpayWebhookService({
        payload: req.body,
        signature: req.headers["x-razorpay-signature"],
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Webhook processed successfully."
        )
    );
});