import { ApiError } from "../../../utils/ApiError.js";
import logger from "../../../config/logger.js";
import { nameValidator, avatarValidator } from "../../../validations/auth.validators.js";
import { getUserById, getOrganizationByUserId, deleteOrganization } from "../user.repository.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../../../integrations/cloudinary.integration.js";
import { cleanupAvatar } from "../../auth/auth.helper.js";









export const getUserService = async (userId) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    logger.info({
        userId: user._id,
        email: user.email,
    }, "user.retrieved");

    return user;
};







export const updateUserService = async (userId, payload) => {
    if (!payload.name.trim()) {
        throw new ApiError(400, "Name is required");
    }

    const nameError = nameValidator(payload.name);
    if (!nameError.valid) {
        throw new ApiError(400, `Name is invalid: ${nameError.errors.join(", ")}`);
    }

    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.name = payload.name.trim();

    await user.save();

    logger.info({
        userId: user._id,
        email: user.email,
        updatedFields: Object.keys(payload),
    }, "user.updated");

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
    };
};









export const updateUserAvatarService = async (userId, avatarFile) => {
    if (!avatarFile) {
        throw new ApiError(400, "Avatar image is required");
    }

    const cleanUp = (reason) => cleanupAvatar(avatarFile, reason);

    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const avatarError = avatarValidator(avatarFile);
    if (!avatarError.valid) {
        cleanUp("Avatar Validation failed while updating user avatar");
        throw new ApiError(400, `Avatar image is invalid: ${avatarError.errors.join(", ")}`);
    }

    const oldAvatarPublicId = user.avatar?.publicId;

    let avatarUrl;
    let avatarPublicId;

    if (avatarFile?.path) {
        const result = await uploadOnCloudinary(
            avatarFile.path,
            "MySaaS/users/avatars"
        );

        if (!result) {
            throw new ApiError(500, "Failed to upload avatar image");
        }
        avatarUrl = result.url;
        avatarPublicId = result.publicId;
    }

    user.avatar = {
        url: avatarUrl,
        publicId: avatarPublicId,
    };

    try {
        await user.save();
    } catch (err) {
        await deleteFromCloudinary(avatarPublicId);
        throw new ApiError(500, "Failed to update user avatar");
    }

    if (oldAvatarPublicId) {
        await deleteFromCloudinary(oldAvatarPublicId);
    }

    logger.info({
        userId: user._id,
        email: user.email,
        publicId: avatarPublicId,
    }, "user.avatar.updated");

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
    };
};










export const deleteUserAvatarService = async (userId) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const avatarPublicId = user.avatar?.publicId;
    if (!avatarPublicId) {
        throw new ApiError(400, "No avatar to delete");
    }

    user.avatar.url = null;
    user.avatar.publicId = null;

    try {
        await user.save();
    } catch (err) {
        throw new ApiError(500, "Failed to delete user avatar");
    }

    try {
        if (avatarPublicId) {
            await deleteFromCloudinary(avatarPublicId);
        }
    } catch (err) {
        logger.error({
            userId: user._id,
            avatarPublicId,
            error: err.message,
            stack: err.stack,
        }, "user.avatar.cloudinary_delete_failed");
    }

    logger.info({
        userId: user._id,
        email: user.email,
        publicId: avatarPublicId,
    }, "user.avatar.deleted");

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
    };
};







export const deleteUserService = async (userId) => {
    const user = await getUserById(userId, "+password");
    if (!user) { throw new ApiError(404, "User not found"); }

    if (user.avatar?.publicId) {
        try {
            await deleteFromCloudinary(user.avatar.publicId);
        } catch (err) {
            logger.error({
                userId: user._id,
                avatarPublicId: user.avatar.publicId,
                error: err.message,
                stack: err.stack,
            }, "user.avatar.cloudinary_delete_failed");
        }
    }

    // invalidate all sessions
    // user.sessions = user.sessions.map((session) => ({
    //     ...session,
    //     isActive: false,
    //     refreshToken: null,
    // }));

    // or remove all sessions to force logout from all devices immediately
    user.sessions = [];

    user.password = null;

    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    if (user.phone) {
        user.phone.otpHash = null;
        user.phone.otpExpiry = null;
        user.phone.pendingNumber = null;
    }

    if (user.providers?.google) {
        user.providers.google.enabled = false;
        user.providers.google.googleId = null;
    }
    if (user.providers?.local) {
        user.providers.local.enabled = false;
    }

    user.accountStatus = "deleted";

    user.avatar = {
        url: null,
        publicId: null,
    };

    const organization = await getOrganizationByUserId(user._id);
    if (organization) {
        await deleteOrganization(organization._id);
    }

    // Appended deleted_ prefix with user ID to ensure uniqueness
    // and to prevent conflicts if user tries to register again with same email after deletion
    user.email = `deleted_${user._id}_${user.email}`;

    try {
        await user.save();
    } catch (err) {
        logger.error({
            userId: user._id,
            email: user.email,
            error: err.message,
            stack: err.stack,
        }, "user.account.delete_failed");

        throw new ApiError(500, "Failed to delete user account");
    }

    logger.info({
        userId: user._id,
        email: user.email,
    }, "user.account.deleted");

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
    };
};