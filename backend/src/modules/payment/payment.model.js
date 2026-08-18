import mongoose, { Schema } from "mongoose";
import { PAYMENT_STATUSES } from "./payment.constants.js";
import { CURRENCY } from "../service/service.constants.js";

const paymentSchema = new Schema(
    {
        organization: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },

        booking: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            default: null,
            index: true,
        },

        provider: {
            type: String,
            enum: ["RAZORPAY"],
            required: true,
            default: "RAZORPAY",
        },

        amount: {
            // Amount in smallest currency unit.
            // ₹1200 = 120000 paise
            type: Number,
            required: true,
            min: 1,
        },

        currency: {
            type: String,
            enum: CURRENCY,
            default: "INR",
            required: true,
            uppercase: true,
        },

        status: {
            type: String,
            enum: PAYMENT_STATUSES,
            default: "CREATED",
            index: true,
        },

        razorpayOrderId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        razorpayPaymentId: {
            type: String,
            default: null,
            index: true,
        },

        failureReason: {
            type: String,
            default: null,
            trim: true,
        },

        failedAt: {
            type: Date,
            default: null,
        },

        paidAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index to optimize queries for payments by organization and creation date.
paymentSchema.index({
    organization: 1,
    createdAt: -1,
});

export const Payment =
    mongoose.models.Payment ||
    mongoose.model("Payment", paymentSchema);