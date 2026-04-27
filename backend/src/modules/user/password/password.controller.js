import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
    changePasswordService,
    // forgotPasswordService,
    // resetPasswordService
} from "./password.service.js";


export const changePassword = asyncHandler(async (req, res) => {
    const data = await changePasswordService(req.user._id, req.user?.sessionId, req.body);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "Password changed successfully. You have been logged out from all other devices."
        ));
});