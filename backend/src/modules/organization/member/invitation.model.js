import mongoose, { Schema } from "mongoose";


const inviteSchema = new Schema({
    organization: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    role: {
        type: String,
        enum: ["member"],
        default: "member"
    },
    invitedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "expired"],
        default: "pending"
    },
    token: {
        type: String,
        select: false
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });


export const Invitation =
    mongoose.models.Invitation ||
    mongoose.model("Invitation", inviteSchema);
