import mongoose, { Schema } from "mongoose";

const memberSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    role: {
        type: String,
        enum: ["owner", "member"],
        default: "member",
    },

    joinedAt: {
        type: Date,
        default: Date.now,
    },

    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    isActive: {
        type: Boolean,
        default: true,
    }
});

const subscriptionSchema = new Schema({
    plan: {
        type: String,
        enum: ["free", "pro", "elite"],
        default: "free",
    },

    status: {
        type: String,
        enum: ["active", "expired", "cancelled"],
        default: "active",
    },

    startDate: {
        type: Date,
        default: Date.now,
    },

    endDate: {
        type: Date,
        default: null,
    }
});

const limitsSchema = new Schema({
    maxUsers: {
        type: Number,
        default: 1,
    },

    aiCredits: {
        type: Number,
        default: 0,
    },

    maxCustomers: {
        type: Number,
        default: 100, // Default limit for free plan (list count)
    }
});

const integrationsSchema = new Schema({
    googleCalendar: {
        isConnected: { type: Boolean, default: false },
        refreshToken: { type: String, default: null },
        email: { type: String, default: null }
    },

    whatsapp: {
        isEnabled: { type: Boolean, default: false } // API later
    }
});

const organizationSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: [memberSchema],

        subscription: subscriptionSchema,

        limits: limitsSchema,

        integrations: integrationsSchema,

        isActive: { // Soft delete flag
            type: Boolean,
            default: true,
        },

        isDeleted: { // Permanent delete flag
            type: Boolean,
            default: false,
        }
    },
    { timestamps: true }
);

// Indexes
organizationSchema.index({ owner: 1 });
organizationSchema.index({ "members.user": 1 });

export const Organization =
    mongoose.models.Organization ||
    mongoose.model("Organization", organizationSchema);