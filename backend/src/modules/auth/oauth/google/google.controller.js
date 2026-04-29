import { ApiResponse } from "../../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../../utils/asyncHandler.js";
import { getCookieOptions } from "../../../../config/cookieOptions.js";
import { googleLoginService } from "./google.service.js";

export const googleLoginController = asyncHandler(async (req, res) => {
    const data = await googleLoginService(req.body.token, req.body.device);

    return res
        .status(200)
        .cookie("accessToken", data.accessToken, getCookieOptions("access"))
        .cookie("refreshToken", data.refreshToken, getCookieOptions("refresh"))
        .json(new ApiResponse(
            200,
            {
                name: data.user.name,
                email: data.user.email,
            },
            `Welcome back, ${data.user.name}!`
        ))
});