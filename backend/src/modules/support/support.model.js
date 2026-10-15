import mongoose, { Schema } from "mongoose";
import { TICKET_STATUSES, TICKET_PRIORITIES, TICKET_CATEGORIES } from "./support.constants.js";

const ticketSchema = new Schema(
    {
        organization: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },

        status: {
            type: String,
            enum: TICKET_STATUSES,
            default: "OPEN",
            index: true,
        },

        priority: {
            type: String,
            enum: TICKET_PRIORITIES,
            default: "MEDIUM",
        },

        category: {
            type: String,
            enum: TICKET_CATEGORIES,
            default: "GENERAL",
        },
    },
    {
        timestamps: true,
    }
);

ticketSchema.index({
    organization: 1,
    createdAt: -1,
});

export const Ticket =
    mongoose.models.Ticket ||
    mongoose.model("Ticket", ticketSchema);
