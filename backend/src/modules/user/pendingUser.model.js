import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
    avatar: {
        url: { type: String, default: null },
        publicId: { type: String, default: null }
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false,
    },

    verificationToken: String,
    verificationTokenExpiry: Date

},
    { timestamps: true }
);


export const PendingUser =
    mongoose.models.PendingUser || mongoose.model("PendingUser", pendingUserSchema);
