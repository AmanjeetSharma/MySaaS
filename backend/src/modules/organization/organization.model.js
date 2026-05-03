import mongoose, { Schema } from "mongoose";

const memberSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: {
        type: String,
        enum: ["member"],
        default: "member"
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    joinedAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
}, { _id: false });

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
}, { _id: false });


const integrationsSchema = new Schema({
    googleCalendar: {
        isConnected: { type: Boolean, default: false },
        refreshToken: { type: String, default: null, select: false },
        email: { type: String, default: null }
    },

    whatsapp: {
        isEnabled: { type: Boolean, default: false },
    }
}, { _id: false });

const organizationSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: [3, "Organization name must be at least 3 characters"],
            maxlength: [50, "Organization name must be at most 50 characters"],
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: [{ type: memberSchema, default: [] }],

        subscription: { type: subscriptionSchema, default: {} },

        integrations: { type: integrationsSchema, default: {} },

        usage: {
            aiCreditsUsed: {
                type: Number,
                default: 0
            },
        }

    },
    { timestamps: true }
);

// Indexes
organizationSchema.index({ owner: 1 }, { unique: true });// Unique index to ensure each user can only own one organization
organizationSchema.index({ "members.user": 1 });

export const Organization =
    mongoose.models.Organization ||
    mongoose.model("Organization", organizationSchema);