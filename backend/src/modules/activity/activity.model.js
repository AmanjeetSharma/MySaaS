import mongoose, { Schema } from "mongoose";
import { ACTIVITY_TYPES } from "../../constants/activityTypes.constants.js";

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
            enum: {
                values: [...ACTIVITY_TYPES, "custom"],
                message: "Invalid activity type"
            },
            required: true,
            default: "note"
        },
        customType: {
            type: String,
            trim: true,
            maxlength: 50,
            default: null
        },

        event: {
            type: String,
            required: true,
            default: null,
            trim: true,
            minlength: [1, 'Activity event cannot be empty'],
            maxlength: [250, 'Activity event cannot exceed 250 characters']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [2000, 'Activity description cannot exceed 2000 characters'],
            default: null
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

activitySchema.index({ organization: 1, customer: 1, createdAt: -1 });
activitySchema.index({ organization: 1, deal: 1, createdAt: -1 });


export const Activity =
    mongoose.models.Activity || mongoose.model('Activity', activitySchema);
