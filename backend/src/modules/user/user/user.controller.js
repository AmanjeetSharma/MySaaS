import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
    getUserService,
    updateUserService
} from "./user.service.js";


export const getUser = asyncHandler(async (req, res) => {
    const data = await getUserService(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "User retrieved successfully"
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
