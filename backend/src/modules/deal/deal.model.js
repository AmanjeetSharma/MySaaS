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
        default: "New Deal",
        trim: true,
        minlength: [1, "Title cannot be empty"],
        maxlength: [255, "Title cannot exceed 255 characters"]
    },

    status: {
        type: String,
        enum: ["active", "won", "lost"],
        default: "active"
    },

    latestActivitySummary: {// latest stage summary for quick reference
        type: String,
        default: null
    },
    latestInteractionAt: {
        type: Date,
        default: null
    },

    closedAt: {
        type: Date,
        default: null
    },


    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });

dealSchema.index({ organization: 1, customer: 1 });
dealSchema.index({ organization: 1, customer: 1, status: 1 });

export const Deal =
    mongoose.models.Deal || mongoose.model('Deal', dealSchema);