import mongoose, { Schema } from "mongoose";

const addressSchema = new Schema({
    street: { type: String, trim: true, default: null },
    city: { type: String, trim: true, default: null },
    state: { type: String, trim: true, default: null },
    country: { type: String, trim: true, default: null },
    zipCode: { type: String, trim: true, default: null },
},
    { _id: false }
);

const serviceSchema = new Schema({
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
    
    // Service fields
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [120, "Service name cannot exceed 120 characters."],
    },

    slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    isSlugStale: { // true when name is changed but slug is not updated yet
        type: Boolean,
        default: false,
    },

    description: {
        type: String,
        trim: true,
        maxlength: [1000, "Service description cannot exceed 1000 characters."],
    },

    mode: {
        type: String,
        enum: ["ONLINE", "OFFLINE"],
        required: true,
    },

    durationInMinutes: {
        type: Number,
        required: true,
        min: [15, "Duration must be at least 15 minutes."],
        max: [999999, "Duration cannot exceed 999999 minutes."], // Arbitrary large max to prevent overflow issues for eg: what if travel with me for 1 week straight? :D
    },

    price: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative"],
    },

    currency: {
        type: String,
        enum: ["INR", "USD", "EUR"],
        default: "INR",
        required: true,
    },

    address: {
        type: addressSchema,
        default: null,
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

    isActive: {
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