import { ApiError } from "../../../utils/ApiError.js";
import {
    getUserById,
} from "../user.repository.js";







export const getUserService = async (userId) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    console.log(`User retrieved: ${user.name} (${user.email})`);

    return user;
};









export const updateUserService = async (userId, updateData, file) => {
    
    return{

    }
};






