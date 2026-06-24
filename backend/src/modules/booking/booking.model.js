import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true,
    },

    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
        index: true,
    },

    booker: {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"],
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            default: null,
            trim: true,
        },
    },

    serviceSnapshot: {
        name: {
            type: String,
            required: true,
        },

        slug: {
            type: String,
            required: true,
        },

        durationInMinutes: {
            type: Number,
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },

        currency: {
            type: String,
            required: true,
        },

        mode: {
            type: String,
            enum: ["ONLINE", "OFFLINE"],
            required: true,
        },
    },

    startTime: {
        type: Date,
        required: true,
        index: true,
    },

    endTime: {
        type: Date,
        required: true,
    },

    timezone: {
        type: String,
        required: true,
    },

    meetingProvider: {
        type: String,
        enum: ["GOOGLE_MEET"],
        default: null,
    },

    meetingLink: {
        type: String,
        default: null,
    },

    status: {
        type: String,
        enum: [
            "PENDING",
            "CONFIRMED",
            "COMPLETED",
            "CANCELLED",
            "NO_SHOW",
        ],
        default: "CONFIRMED",
        index: true,
    },

    cancellationReason: {
        type: String,
        default: null,
        trim: true,
        maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
    },

    cancelledAt: {
        type: Date,
        default: null,
    },

    completedAt: {
        type: Date,
        default: null,
    },

    notes: {
        type: String,
        default: null,
        trim: true,
        maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
},
    {
        timestamps: true,
    }
);

bookingSchema.index({ organization: 1, startTime: 1, });

bookingSchema.index({ booker: 1, startTime: -1, });

bookingSchema.index({ service: 1, startTime: -1, });

bookingSchema.index({ organization: 1, status: 1, });

bookingSchema.index({ organization: 1, startTime: 1, endTime: 1, });

export const Booking =
    mongoose.models.Booking ||
    mongoose.model("Booking", bookingSchema);