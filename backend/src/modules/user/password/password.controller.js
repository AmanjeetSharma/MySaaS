import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
    changePasswordService,
    forgotPasswordService,
    resetPasswordService
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


export const forgotPassword = asyncHandler(async (req, res) => {
    const data = await forgotPasswordService(req.body.email);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "If an account exists with this email, a password reset link has been sent."
        ));
});


export const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword, confirmNewPassword } = req.body;
    const data = await resetPasswordService(token, newPassword, confirmNewPassword);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "Password has been reset successfully. You can now log in with your new password."
        ));
});