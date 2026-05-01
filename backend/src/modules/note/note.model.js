import mongoose, { Schema } from "mongoose";

const noteSchema = new Schema(
    {
        organization: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
            index: true
        },
        deal: {
            type: Schema.Types.ObjectId,
            ref: "Deal",
            default: null,
            index: true
        },
        content: {
            type: String,
            required: true,
            trim: true,
            minlength: [1, 'Note content cannot be empty'],
            maxlength: [2000, 'Note content cannot exceed 2000 characters']
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
    },
    {
        timestamps: true
    }
);

noteSchema.index({ organization: 1, customer: 1, createdAt: -1 });
noteSchema.index({ organization: 1, deal: 1, createdAt: -1 });


export const Note =
    mongoose.models.Note || mongoose.model('Note', noteSchema);
