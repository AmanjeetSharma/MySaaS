import mongoose, { Schema } from "mongoose";

const memberSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["member"], default: "member" },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    joinedAt: { type: Date, default: Date.now },
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


const integrationsSchema = new Schema({
    googleCalendar: {
        isConnected: { type: Boolean, default: false },
        refreshToken: { type: String, default: null },
        email: { type: String, default: null }
    },

    whatsapp: {
        isEnabled: { type: Boolean, default: false },
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

        integrations: integrationsSchema,

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
organizationSchema.index({ owner: 1 });
organizationSchema.index({ "members.user": 1 });

export const Organization =
    mongoose.models.Organization ||
    mongoose.model("Organization", organizationSchema);