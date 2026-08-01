import mongoose, { Schema } from "mongoose";

const memberSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: {
        type: String,
        enum: ["member"],
        default: "member"
    },
    invitedBy: {
        type: Schema.Types.ObjectId,
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
        enum: ["free", "pro"],
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


const googleIntegrationSchema = new Schema({
    isConnected: {
        type: Boolean,
        default: false,
    },

    refreshToken: {
        encryptedData: {
            type: String,
            default: null,
            select: false,
        },
        iv: {// Initialization Vector
            type: String,
            default: null,
            select: false,
        },
        authTag: {// Authentication Tag for AES-GCM (algorithm used for encryption)
            type: String,
            default: null,
            select: false,
        },
    },

    email: {
        type: String,
        default: null,
        lowercase: true,
        trim: true,
    },

    googleAccountId: {
        type: String,
        default: null,
        trim: true,
    },

    connectedAt: {
        type: Date,
        default: null,
    },

    // Google Calendar config
    calendarId: {
        type: String,
        default: "primary",
        trim: true,
    },

    calendarName: {
        type: String,
        default: null,
        trim: true,
    },

    calendarDescription: {
        type: String,
        default: null,
        trim: true,
    },

}, { _id: false });

// future implementation
const whatsappIntegrationSchema = new Schema({
    isConnected: {
        type: Boolean,
        default: false,
    },
}, { _id: false });

const zoomIntegrationSchema = new Schema({
    isConnected: {
        type: Boolean,
        default: false,
    },
}, { _id: false });

const microsoftIntegrationSchema = new Schema({
    isConnected: {
        type: Boolean,
        default: false,
    },
}, { _id: false });


const integrationsSchema = new Schema({
    google: {
        type: googleIntegrationSchema,
        default: {}
    },
    whatsapp: {
        type: whatsappIntegrationSchema,
        default: {}
    },
    microsoft: {
        type: microsoftIntegrationSchema,
        default: {}
    },
    zoom: {
        type: zoomIntegrationSchema,
        default: {}
    },
}, { _id: false });


const usageSchema = new Schema({
    aiCreditsUsed: {
        type: Number,
        default: 0,
    },
    customerCount: {
        type: Number,
        default: 0,
    },
    memberCount: {
        type: Number,
        default: 0,
    }
}, { _id: false });

const organizationSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, "Organization name must be at least 3 characters"],
        maxlength: [80, "Organization name must be at most 80 characters"],
    },

    description: {
        type: String,
        default: "",
        trim: true,
        maxlength: [500, "Organization description must be at most 500 characters"],
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    isSlugStale: { // Flag to indicate if slug needs to be updated based on name changes
        type: Boolean,
        default: false,
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    members: [{ type: memberSchema, default: [] }],

    subscription: { type: subscriptionSchema, default: {} },

    integrations: { type: integrationsSchema, default: {} },

    usage: { type: usageSchema, default: {} },

},
    { timestamps: true }
);

// Indexes
organizationSchema.index({ owner: 1 }, { unique: true });// Unique index to ensure each user can only own one organization
organizationSchema.index({ "members.user": 1 });

export const Organization =
    mongoose.models.Organization ||
    mongoose.model("Organization", organizationSchema);