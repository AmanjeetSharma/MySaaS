import mongoose, { Schema } from 'mongoose';

const sessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true },
    device: { type: String, default: 'Unknown Device' },
    refreshToken: { type: String, required: true, select: false },
    firstLogin: { type: Date, default: Date.now },
    latestLogin: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
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

    providers: {
        local: {
            enabled: { type: Boolean, default: true }
        },
        google: {
            enabled: { type: Boolean, default: false },
            googleId: { type: String, default: null }
        }
    },


    resetPasswordToken: { type: String, default: null, select: false },
    resetPasswordExpiry: { type: Date, default: null, select: false },


    activeOrganization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null
    },


    settings: settingsSchema,
    sessions: [sessionSchema],

    accountStatus: {
        type: String,
        enum: ["active", "suspended", "deleted"],// in suspended user cant login, deletedd is for soft delete (data deleted but entry is there for record purposes)
        default: "active",
    }

}, {
    timestamps: true
});

// Acts as middleware to limit sessions to 6 per user
userSchema.pre("save", function (next) {
    if (this.sessions && this.sessions.length > 6) {
        this.sessions.sort((a, b) => new Date(a.latestLogin) - new Date(b.latestLogin));

        this.sessions = this.sessions.slice(-6);
    }
});

userSchema.index({ "sessions.sessionId": 1 });// index for sessionId to optimize session lookups

export const User =
    mongoose.models.User || mongoose.model('User', userSchema);