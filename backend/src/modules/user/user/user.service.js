import { ApiError } from "../../../utils/ApiError.js";
import { nameValidator, avatarValidator } from "../../../validations/auth.validators.js";
import { getUserById, } from "../user.repository.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../../../integrations/cloudinary.integration.js";
import { cleanupAvatar } from "../../auth/auth.helper.js";



export const getUserService = async (userId) => {
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    console.log(`User retrieved | ${user.name} (${user.email})`);

    return user;
};







export const updateUserService = async (userId, payload) => {
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

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

    console.log(`User updated | name: ${user.name} | email: ${user.email}`);

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
    };
};









export const updateUserAvatarService = async (userId, avatarFile) => {
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }
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

    console.log(`User avatar updated | email: ${user.email} | publicId: ${avatarPublicId}`);

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
    };
};










export const deleteUserAvatarService = async (userId) => {
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

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
        console.error(`Failed to delete avatar from Cloudinary for user ${user.email} | publicId: ${avatarPublicId} | error: ${err.message}`);
    }

    console.log(`User avatar deleted | email: ${user.email} | deletedAvatarPublicId: ${avatarPublicId}`);

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
    };
};



