import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ApiError } from "../../../utils/ApiError.js";
import { sendEmail } from "../../../integrations/email.integration.js";
import { resetEmailTemplate } from "../../../utils/email/resetEmailTemplate.js"
import { passwordValidator } from "../../../validations/auth.validators.js";
import { getUserById, getUserByEmail, getUserByHashedToken } from "../user.repository.js";
import { generateToken } from "../../../utils/token.js";
import env from "../../../config/env.config.js";










export const changePasswordService = async (userId, currentSessionId,
    {
        currentPassword,
        newPassword,
        confirmNewPassword
    }) => {
    console.log(currentPassword, newPassword, confirmNewPassword)

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

    if (!user.providers.local.enabled) {
        throw new ApiError(
            400,
            // "This account currently uses Google Sign-In only. Please set a password first from account settings."
            "OMG for fk sake dont try to change password if you dont have one, its just common sense..."
        );
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

    // Invalidate all other sessions and tokens except current
    for (const session of user.sessions) {
        if (String(session.sessionId) !== String(currentSessionId)) {
            session.isActive = false;
            session.refreshToken = null;
        }
    }

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









export const setupPasswordService = async (userId, { newPassword, confirmNewPassword }) => {
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

    const user = await getUserById(userId, "+password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.providers.local.enabled) {
        throw new ApiError(400, "Password is already set for this account");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.providers.local.enabled = true;

    try {
        await user.save();
    } catch (err) {
        console.error("Error setting up password:", err);
        throw new ApiError(500, "Error setting up password");
    }

    console.log(`Password setup successful for email: ${user.email}`);

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
    };
};











export const forgotPasswordService = async (email) => {
    if (!email) {
        throw new ApiError(400, "Email is required");
    }
    const normalizedEmail = email.toLowerCase().trim();

    const user = await getUserByEmail(normalizedEmail);
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    if (!user.providers.local.enabled) {
        throw new ApiError(400, "This account is currently using Google Sign-In. Please sign in with Google, or setup a password in your account settings to enable password reset.");
    }

    if (!user) {
        await delay(2300); // 2.3 second delay to mitigate user enumeration attacks
        console.log(`User with email ${normalizedEmail} does not exist.`);
        return null;
    }

    const { rawToken, hashedToken, expiry } = generateToken();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = expiry;

    try {
        await user.save();
    } catch (err) {
        throw new ApiError(500, "Error generating password reset token");
    }

    const resetLink = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;

    const emailContent = resetEmailTemplate(user.name, resetLink);

    if (env.EMAIL_ENABLED) { // Only send email if enabled
        await sendEmail(user.email, "Reset Your Password - MySaaS", emailContent, true);
    }

    console.log(`[sendEmail] for password reset: ${env.EMAIL_ENABLED ? 'Email sent' : 'Email sending disabled, skipping...'}`);
    console.log(`Reset link for ${user.email}: ${resetLink}`); // link for testing (debug log)

    return null;
};









export const resetPasswordService = async (rawToken, newPassword, confirmNewPassword) => {
    if (!rawToken) {
        throw new ApiError(400, "Reset token is missing");
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

    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await getUserByHashedToken(hashedToken, "+password +sessions.refreshToken");
    if (!user) {
        throw new ApiError(400, "Reset token is invalid or your link has expired");
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
        throw new ApiError(400, "New password must be different from old password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Invalidate all sessions and tokens
    user.sessions.forEach((session) => {
        session.isActive = false;
        session.refreshToken = null;
    });

    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;

    try {
        await user.save();
    } catch (err) {
        throw new ApiError(500, "Error resetting password");
    }

    console.log(`Password reset successful for email: ${user.email}`);

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
    };
};

