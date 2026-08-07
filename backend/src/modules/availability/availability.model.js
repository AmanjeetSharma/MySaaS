import mongoose from "mongoose";
import {
    TIMEZONES,
    DEFAULT_TIMEZONE,
} from "../../constants/timezone.constants.js";

const timeSlotSchema = new mongoose.Schema(
    {
        startTime: {
            type: Number,
            required: true,
            min: 0,
            max: 1439,
        },
        endTime: {
            type: Number,
            required: true,
            min: 1,
            max: 1440,
        },
    },
    { _id: false }
);

const dayAvailabilitySchema = new mongoose.Schema(
    {
        enabled: {
            type: Boolean,
            default: false,
        },

        slots: {
            type: [timeSlotSchema],
            default: [],
        },
    },
    { _id: false }
);

const DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

const availabilityFields = {
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
        unique: true,
        index: true,
    },

    timezone: {
        type: String,
        enum: TIMEZONES,
        default: DEFAULT_TIMEZONE,
        required: true,
    },
};

DAYS.forEach((day) => {
    availabilityFields[day] = {
        type: dayAvailabilitySchema,
        default: () => ({}),
    };
});

const availabilitySchema = new mongoose.Schema(availabilityFields, {
    timestamps: true,
});

export const Availability =
    mongoose.models.Availability ||
    mongoose.model("Availability", availabilitySchema);