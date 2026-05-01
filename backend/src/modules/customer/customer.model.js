import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema(
    {
        organization: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true
        },
        currentDeal: {
            type: Schema.Types.ObjectId,
            ref: "Deal",
            default: null
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: [3, 'Name must be at least 3 characters long'],
            maxlength: [50, 'Name cannot exceed 50 characters']
        },
        email: {// not unique across organization, only unique within organization for muti-tenant support
            type: String,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
            index: true,
            sparse: true
        },

        source: {
            type: String,
            enum: ["manual", "booking"],// manual for notes, booking for public-link booking
            default: "manual"
        },

        latestNoteSummary: {//this will show the summary of latest stage of relationship with customer
            type: String,
            default: null
        },

        latestInteractionAt: {
            type: Date,
            default: null
        },

        isDeleted: { // delete all notes and interactions when this is true, but keep record for analytics and safety
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

customerSchema.index(
    { organization: 1, email: 1 },
    { unique: true, sparse: true, partialFilterExpression: { email: { $type: "string", $ne: "" } } }
);

customerSchema.index(
    { organization: 1, phone: 1 },
    { unique: true, sparse: true, partialFilterExpression: { phone: { $type: "string", $ne: "" } } }
);
export const Customer =
    mongoose.models.Customer || mongoose.model('Customer', customerSchema);