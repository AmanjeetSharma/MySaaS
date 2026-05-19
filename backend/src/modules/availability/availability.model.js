import mongoose from "mongoose";
import { timezones } from "../../config/timezone.config.js";

const timeSlotSchema = new mongoose.Schema({
    startTime: { type: String, required: true, },
    endTime: { type: String, required: true, },
}, { _id: false });


const dayAvailabilitySchema = new mongoose.Schema({
    enabled: { type: Boolean, default: false, },
    slots: {
        type: [timeSlotSchema],
        default: [],
    },
}, { _id: false });


const availabilitySchema = new mongoose.Schema({
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        default: null,
    },

    timezone: {
        type: String,
        enum: timezones,
        default: "Asia/Kolkata",
    },

    monday: {
        type: dayAvailabilitySchema,
        default: () => ({}),
    },

    tuesday: {
        type: dayAvailabilitySchema,
        default: () => ({}),
    },

    wednesday: {
        type: dayAvailabilitySchema,
        default: () => ({}),
    },

    thursday: {
        type: dayAvailabilitySchema,
        default: () => ({}),
    },

    friday: {
        type: dayAvailabilitySchema,
        default: () => ({}),
    },

    saturday: {
        type: dayAvailabilitySchema,
        default: () => ({}),
    },

    sunday: {
        type: dayAvailabilitySchema,
        default: () => ({}),
    },
}, { timestamps: true, }
);

export const Availability =
    mongoose.model.Availability ||
    mongoose.model("Availability", availabilitySchema);