import mongoose, { Schema } from "mongoose";

const dealSchema = new Schema({
    organization: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    },

    customer: {
        type: Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },

    title: {
        type: String,
        default: "General"
    },

    status: {
        type: String,
        enum: ["active", "won", "lost"],
        default: "active"
    },

    latestInteractionAt: {
        type: Date,
        default: null
    },

    startedAt: {
        type: Date,
        default: Date.now
    },

    closedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

dealSchema.index({ organization: 1, customer: 1 });
dealSchema.index({ organization: 1, status: 1 });

export const Deal =
    mongoose.models.Deal || mongoose.model('Deal', dealSchema);