import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getCookieOptions } from "../../config/cookieOptions.js";
import {
    registerService,
    verifyEmailService,
    loginService,
    logoutService,
    refreshTokenService,
} from "./auth.service.js";






export const registerController = asyncHandler(async (req, res) => {
    const data = await registerService(req.body, req.file);

    return res.status(201).json(
        new ApiResponse(
            201,
            data,
            "Verification email sent"
        )
    );
});


export const verifyEmailController = asyncHandler(async (req, res) => {
    const data = await verifyEmailService(req.params.token);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Email verified successfully!\nYou can login now."
        )
    );
});


export const loginController = asyncHandler(async (req, res) => {
    const data = await loginService(req.body);

    return res
        .status(200)
        .cookie("accessToken", data.accessToken, getCookieOptions("access"))
        .cookie("refreshToken", data.refreshToken, getCookieOptions("refresh"))
        .json(
            new ApiResponse(
                200,
                {
                    name: data.user.name,
                    email: data.user.email,
                },
                `Welcome back, ${data.user.name}!`
            )
        )
});


export const logoutController = asyncHandler(async (req, res) => {
    const data = await logoutService(req.cookies?.refreshToken, req.user?._id);

    return res
        .status(200)
        .clearCookie("accessToken", getCookieOptions("access"))
        .clearCookie("refreshToken", getCookieOptions("refresh"))
        .json(
            new ApiResponse(
                200,
                data,
                "Logged out successfully"
            )
        )
});


export const refreshTokenController = asyncHandler(async (req, res) => {
    const data = await refreshTokenService(req.cookies?.refreshToken);

    return res
        .status(200)
        .cookie("accessToken", data.newAccessToken, getCookieOptions("access"))
        .json(
            new ApiResponse(
                200,
                {
                    name: data.user.name,
                    email: data.user.email,
                },
                "Token refreshed"
            )
        )
});
