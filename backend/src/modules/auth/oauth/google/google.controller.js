import { ApiResponse } from "../../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../../utils/asyncHandler.js";
import { getCookieOptions } from "../../../../config/cookieOptions.js";
import {
    googleLoginService,
    googleUnlinkService,
} from "./google.service.js";

export const googleLoginController = asyncHandler(async (req, res) => {
    const data = await googleLoginService(req.body);

    return res
        .status(200)
        .cookie("accessToken", data.accessToken, getCookieOptions("access"))
        .cookie("refreshToken", data.refreshToken, getCookieOptions("refresh"))
        .json(new ApiResponse(
            200,
            {
                name: data.user.name,
                email: data.user.email,
                message: data.message,
            },
            data.message
        ))
});


export const googleUnlinkController = asyncHandler(async (req, res) => {
    const data = await googleUnlinkService(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "Google login has been unlinked successfully"
        ))
});