import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        organization: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            default: null,
            index: true,
        },

        type: {
            type: String,
            required: true,
            trim: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, "Notification title cannot exceed 100 characters"],
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: [300, "Notification message cannot exceed 300 characters"],
        },

        data: {
            type: Schema.Types.Mixed,
            default: {},
        },

        read: {
            type: Boolean,
            default: false,
            index: true,
        },

        readAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({
    user: 1,
    createdAt: -1,
});

notificationSchema.index({
    user: 1,
    read: 1,
    createdAt: -1,
});

notificationSchema.index({
    organization: 1,
    createdAt: -1,
});

export const Notification =
    mongoose.models.Notification ||
    mongoose.model("Notification", notificationSchema);
