import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { registerService, verifyEmailService } from "./auth.service.js";






export const register = asyncHandler(async (req, res) => {
    const data = await registerService(req.body, req.file);

    return res.status(201).json(
        new ApiResponse(
            201,
            data,
            "Verification email sent"
        )
    );
});


export const verifyEmail = asyncHandler(async (req, res) => {
    const data = await verifyEmailService(req.params.token);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Email verified successfully!\nYou can login now."
        )
    );
});