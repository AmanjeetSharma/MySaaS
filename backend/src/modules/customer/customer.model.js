import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema(
    {
        organization: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true
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
            enum: ["manual", "booking"],// manual for notes, booking for public-link created customers
            default: "manual"
        },

        latestNoteSummary: {// latest stage summary for quick reference
            type: String,
            default: null
        },

        latestInteractionAt: {
            type: Date,
            default: null
        },

        isDeleted: {
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