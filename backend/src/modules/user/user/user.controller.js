import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
    getUserService,
    updateUserService,
    updateUserAvatarService,
    deleteUserAvatarService
} from "./user.service.js";


export const getUser = asyncHandler(async (req, res) => {
    const data = await getUserService(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "User fetched successfully"
        ));
});


export const updateUser = asyncHandler(async (req, res) => {
    const data = await updateUserService(req.user._id, req.body);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "User updated successfully"
        ));
});


export const updateUserAvatar = asyncHandler(async (req, res) => {
    const data = await updateUserAvatarService(req.user._id, req.file);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "User avatar updated successfully"
        ));
});


export const deleteUserAvatar = asyncHandler(async (req, res) => {
    const data = await deleteUserAvatarService(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "User avatar deleted successfully"
        ));
});