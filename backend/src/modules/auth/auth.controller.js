import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getCookieOptions } from "../../config/cookieOptions.js";
import {
    registerService,
    verifyEmailService,
    loginService,
    logoutService,
    logoutAllService,
    refreshTokenService,
} from "./auth.service.js";






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


export const login = asyncHandler(async (req, res) => {
    const data = await loginService(req.body);

    const cookieOptions = getCookieOptions();
    return res
        .status(200)
        .cookie("accessToken", data.accessToken, cookieOptions)
        .cookie("refreshToken", data.refreshToken, cookieOptions)
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


export const logout = asyncHandler(async (req, res) => {
    const data = await logoutService(req.cookies?.refreshToken, req.user?._id);

    const cookieOptions = getCookieOptions();  
    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(
                200,
                data,
                "Logged out successfully"
            )
        )
});


export const logoutAll = asyncHandler(async (req, res) => {
    const data = await logoutAllService(req.cookies?.refreshToken, req.user?._id);

    const cookieOptions = getCookieOptions();
    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(
                200,
                data,
                "Logged out from all devices successfully"
            )
        )
});


export const refreshToken = asyncHandler(async (req, res) => {
    const data = await refreshTokenService(req.cookies?.refreshToken);

    const cookieOptions = getCookieOptions();
    return res
        .status(200)
        .cookie("accessToken", data.newAccessToken, cookieOptions)
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
