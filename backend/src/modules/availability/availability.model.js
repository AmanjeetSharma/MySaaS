import mongoose from "mongoose";
import { TIMEZONES, DEFAULT_TIMEZONE } from "../../constants/timezone.constants.js";

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
        enum: TIMEZONES,
        default: DEFAULT_TIMEZONE,
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