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

        latestInteractionAt: {
            type: Date,
            default: null
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: null
        },
    },
    { timestamps: true }
);

customerSchema.index(
    { organization: 1, name: 1 },
    { unique: true, partialFilterExpression: { isDeleted: false } }
)

customerSchema.index(
    { organization: 1, email: 1 },
    { unique: true, sparse: true, partialFilterExpression: { email: { $type: "string", $ne: "" }, isDeleted: false } }
);

customerSchema.index(
    { organization: 1, phone: 1 },
    { unique: true, sparse: true, partialFilterExpression: { phone: { $type: "string", $ne: "" }, isDeleted: false } }
);
export const Customer =
    mongoose.models.Customer || mongoose.model('Customer', customerSchema);