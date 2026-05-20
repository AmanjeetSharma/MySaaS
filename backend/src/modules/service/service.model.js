import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true,
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    // Basic info

    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },

    slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },

    description: {
        type: String,
        trim: true,
        maxlength: 1000,
    },

    mode: {
        type: String,
        enum: ["ONLINE", "OFFLINE"],
        required: true,
    },

    durationInMinutes: {
        type: Number,
        required: true,
        min: 15,
        max: 999999,// Arbitrary large max to prevent overflow issues for eg: what if travel with me for 1 week straight? :D
    },

    price: {
        type: Number,
        required: true,
        min: 0,
    },

    currency: {
        type: String,
        enum: ["INR", "USD", "EUR"],
        default: "INR",
    },

    offlineAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
    },

    onlineMeetingProvider: {
        type: String,
        enum: ["GOOGLE_MEET"],
        default: "GOOGLE_MEET",
    },

    autoGenerateMeetingLink: {
        type: Boolean,
        default: true,
    },

    maximumAdvanceBookingDays: {
        type: Number,
        default: 60,
    },

    allowCancellation: {
        type: Boolean,
        default: true,
    },

    cancellationDeadlineHours: {
        type: Number,
        default: 24,
    },

    allowReschedule: {
        type: Boolean,
        default: true,
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    readinessStatus: {
        type: String,
        enum: [
            "READY", //set isReadyForBooking to true when this is READY
            "MISSING_ADDRESS",
            "MISSING_CALENDAR_INTEGRATION",
            "INCOMPLETE_CONFIGURATION",
        ],
        default: "INCOMPLETE_CONFIGURATION",
    },

    isReadyForBooking: {
        type: Boolean,
        default: false,
    },
},
    { timestamps: true }
);


serviceSchema.index({ organization: 1, slug: 1 }, { unique: true });// Unique slug per organization


export const Service =
    mongoose.models.Service ||
    mongoose.model("Service", serviceSchema);