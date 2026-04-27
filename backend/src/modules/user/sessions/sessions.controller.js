import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
    getUserSessionsService,
    logoutSessionByIdService,
    logoutAllSessionsService
} from "./sessions.service.js";


export const getUserSessions = asyncHandler(async (req, res) => {
    const data = await getUserSessionsService(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "User sessions retrieved successfully"
        ));
});


export const logoutSessionById = asyncHandler(async (req, res) => {
    const data = await logoutSessionByIdService(req.user._id, req.params.sessionId);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "Session logged out successfully"
        ));
});


export const logoutAllSessions = asyncHandler(async (req, res) => {
    const data = await logoutAllSessionsService(req.user?._id, req.cookies?.refreshToken);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                data,
                "Logged out from all devices successfully"
            )
        )
});
