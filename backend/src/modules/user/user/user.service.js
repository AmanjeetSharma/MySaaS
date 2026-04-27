import { ApiError } from "../../../utils/ApiError.js";
import { nameValidator } from "../../../validations/auth.validators.js";
import {
    getUserById,
} from "../user.repository.js";





export const getUserService = async (userId) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    console.log(`User retrieved | ${user.name} (${user.email})`);

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

    console.log(`User updated | name: ${user.name} | email: ${user.email}`);

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
    };
};






