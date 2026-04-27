import bcrypt from "bcryptjs";
import { ApiError } from "../../../utils/ApiError.js";
import { sendEmail } from "../../../services/email.service.js";
import { resetEmailTemplate } from "../../../utils/email/resetEmailTemplate.js"
import { passwordValidator } from "../../../validations/auth.validators.js";
import { getUserById } from "../user.repository.js";










export const changePasswordService = async (
    userId,
    currentSessionId,
    {
        currentPassword,
        newPassword,
        confirmNewPassword
    }) => {

    if (!userId) {
        throw new ApiError(400, "Unauthorized");
    }

    if (!currentPassword) {
        throw new ApiError(400, "Current password is required");
    }
    if (!newPassword) {
        throw new ApiError(400, "New password is required");
    }
    if (!confirmNewPassword) {
        throw new ApiError(400, "Confirm new password is required");
    }

    const passwordError = passwordValidator(newPassword);
    if (!passwordError.valid) {
        throw new ApiError(400, `Password is invalid: ${passwordError.errors.join(", ")}`);
    }

    if (newPassword !== confirmNewPassword) {
        throw new ApiError(400, "New password and confirm new password do not match");
    }

    const user = await getUserById(userId, "+password +sessions.refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const currentSession = user.sessions.find((session) =>
        String(session.sessionId) === String(currentSessionId) && session.isActive
    );
    if (!currentSession) {
        throw new ApiError(401, "Current session invalid or expired");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new ApiError(400, "Current password is incorrect");
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
        throw new ApiError(400, "New password cannot be the same as the current password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    user.sessions = user.sessions.map((session) => {
        if (String(session.sessionId) === String(currentSessionId)) {
            return session; // keep current session active
        }

        return {
            ...session,
            isActive: false,
            refreshToken: null
        };
    });

    try {
        await user.save();
    } catch (err) {
        throw new ApiError(500, "Error saving new password");
    }

    console.log(`Password changed | Email: ${user.email} | Current Device: ${currentSession.device}`);

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
    };

};









