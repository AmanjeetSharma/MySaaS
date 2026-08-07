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

const availabilitySchema = new mongoose.Schema(
    {
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

        days: {
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
        },
    }, { timestamps: true }
);

// To validate that the slots for each day are valid and do not overlap
availabilitySchema.pre("validate", function () {
    for (const [dayName, day] of Object.entries(this.days ?? {})) {
        if (!day) continue;

        const slots = [...(day.slots ?? [])].sort(
            (a, b) => a.startTime - b.startTime
        );

        if (!day.enabled) {
            continue;
        }

        if (slots.length === 0) {
            this.invalidate(
                `days.${dayName}.slots`,
                "Enabled day must contain at least one slot."
            );
            continue;
        }

        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];

            if (slot.endTime <= slot.startTime) {
                this.invalidate(
                    `days.${dayName}.slots.${i}`,
                    "End time must be after start time."
                );
            }

            if (i > 0 && slot.startTime < slots[i - 1].endTime) {
                this.invalidate(
                    `days.${dayName}.slots.${i}`,
                    "Slots cannot overlap."
                );
            }
        }
    }
});

export const Availability =
    mongoose.models.Availability ||
    mongoose.model("Availability", availabilitySchema);