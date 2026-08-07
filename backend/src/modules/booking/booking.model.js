import mongoose, { Schema } from "mongoose";
import { BOOKING_STATUSES } from "./booking.constants.js";

const addressSnapshotSchema = new Schema({
    street: { type: String, trim: true, default: null },
    city: { type: String, trim: true, default: null },
    state: { type: String, trim: true, default: null },
    country: { type: String, trim: true, default: null },
    zipCode: { type: String, trim: true, default: null },
}, { _id: false });

const bookerSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
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
}, { _id: false });

const serviceSnapshotSchema = new Schema({
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

    meetingProvider: {
        type: String,
        enum: ["GOOGLE_MEET", "WHATSAPP", "ZOOM", "MICROSOFT_TEAMS",],
        default: null,
    },

    autoGenerateMeetingLink: {
        type: Boolean,
        default: false,
    },

    address: {
        type: addressSnapshotSchema,
        default: null,
    },
}, { _id: false });


const meetingSchema = new Schema({
    provider: {
        type: String,
        enum: ["GOOGLE_MEET", "WHATSAPP", "ZOOM", "MICROSOFT_TEAMS",],
        default: null,
    },

    link: {
        type: String,
        trim: true,
        default: null,
    },
}, { _id: false });

const calendarEventSchema = new Schema({
    provider: {
        type: String,
        enum: ["GOOGLE"],
        default: null,
    },

    calendarId: {
        type: String,
        default: null,
        trim: true,
    },

    eventId: {
        type: String,
        default: null,
    },

    htmlLink: {
        type: String,
        trim: true,
        default: null,
    },
}, { _id: false });

// for accessing booking details without authentication for booker
const bookingAccessSchema = new Schema({
    hashedToken: {
        type: String,
        default: null,
        select: false,
    },

    expiresAt: {
        type: Date,
        default: null,
    }
}, { _id: false });

// Booking Schema
const bookingSchema = new Schema({
    organization: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true,
    },

    service: {
        type: Schema.Types.ObjectId,
        ref: "Service",
        required: true,
        index: true,
    },

    booker: {
        type: bookerSchema,
        required: true,
    },

    serviceSnapshot: {
        type: serviceSnapshotSchema,
        required: true,
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

    meeting: {
        type: meetingSchema,
        default: {},
    },
    calendarEvent: {
        type: calendarEventSchema,
        default: {},
    },

    status: {
        type: String,
        enum: BOOKING_STATUSES,
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

    bookingAccess: {
        type: bookingAccessSchema,
        default: {},
    },
},
    { timestamps: true, }
);

bookingSchema.pre("validate", function validateBookingTimes() {
    if (this.startTime && this.endTime && this.endTime <= this.startTime) {
        throw new Error("End time must be after start time");
    }
});

bookingSchema.index({ organization: 1, startTime: 1 });

bookingSchema.index({ "booker.email": 1, startTime: -1 });

bookingSchema.index({ service: 1, startTime: -1 });

bookingSchema.index({ organization: 1, status: 1 });

bookingSchema.index({ organization: 1, startTime: 1, endTime: 1 });

export const Booking =
    mongoose.models.Booking ||
    mongoose.model("Booking", bookingSchema);
