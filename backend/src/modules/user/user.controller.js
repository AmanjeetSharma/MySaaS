import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler";
import { getUserService } from "./user.service.js";


export const getProfile = asyncHandler(async (req, res) => {
    const data = await getUserService(req.user.id);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "User profile retrieved successfully"
        ));
});