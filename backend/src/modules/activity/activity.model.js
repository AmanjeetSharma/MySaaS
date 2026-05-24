import mongoose, { Schema } from "mongoose";

const activitySchema = new Schema(
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
        type: {
            type: String,
            trim: true,
            lowercase: true,
            default: "note"
        },
        event: {
            type: String,
            required: true,
            default: null,
            trim: true,
            maxlength: [250, 'Activity event cannot exceed 250 characters']
        },
        description: {
            type: String,
            required: true,
            trim: true,
            minlength: [1, 'Activity description cannot be empty'],
            maxlength: [2000, 'Activity description cannot exceed 2000 characters']
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true
    }
);

activitySchema.index({ organization: 1, customer: 1, createdAt: -1 });
activitySchema.index({ organization: 1, deal: 1, createdAt: -1 });


export const Activity =
    mongoose.models.Activity || mongoose.model('Activity', activitySchema);
