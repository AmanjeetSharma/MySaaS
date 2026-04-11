import mongoose, { Schema } from 'mongoose';

const sessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true },
    device: { type: String, default: 'Unknown Device' },
    refreshToken: String,
    firstLogin: { type: Date, default: Date.now },
    latestLogin: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});


const organizationSchema = new mongoose.Schema({
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    role: { type: String, enum: ['owner', 'member'], default: 'member' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    joinedAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
});



const settingsSchema = new mongoose.Schema({
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    timezone: { type: String, default: "Asia/Kolkata" },
    notifications: {
        email: { type: Boolean, default: false },
        inApp: { type: Boolean, default: true }
    },
});

const userSchema = new Schema({
    avatar: { type: String, required: false },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [30, 'Name cannot exceed 50 characters']
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
        select: false, //not required true for login with google
    },

    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },


    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiry: { type: Date, default: null },


    organizations: [organizationSchema],
    activeOrganization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null
    },


    settings: settingsSchema,
    sessions: [sessionSchema],

    isDeleted: { type: Boolean, default: false },

}, {
    timestamps: true
});

userSchema.index({ email: 1 });// Index for email to ensure uniqueness and fast lookups
userSchema.index({ "organizations.organization": 1 });// Index for organization references to optimize queries by organization
userSchema.index({ "sessions.sessionId": 1 });// Index for sessionId to optimize session lookups

export const User =
    mongoose.model('User', userSchema) || mongoose.models.User;