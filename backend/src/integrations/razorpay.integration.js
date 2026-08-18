import Razorpay from "razorpay";
import crypto from "crypto";
import env from "../config/env.config.js";


const razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
});


export const createRazorpayOrder = async ({
    amount, 
    currency,
    receipt,
}) => {
    return await razorpay.orders.create({
        amount,
        currency,
        receipt,
    });
};


export const verifyRazorpayPaymentSignature = ({
    orderId,
    paymentId,
    signature,
}) => {
    const generatedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

    return generatedSignature === signature;
};


export const verifyRazorpayWebhookSignature = ({
    payload,
    signature,
}) => {
    const generatedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
        .update(payload)
        .digest("hex");

    return generatedSignature === signature;
};