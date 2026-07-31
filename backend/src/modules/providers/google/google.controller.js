import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
    connectGoogleService,
    googleOAuthCallbackService,
    getGoogleIntegrationStatusService,
    listGoogleCalendarsService,
    disconnectGoogleService,
} from "./google.service.js";


export const connectGoogleController = asyncHandler(async (req, res) => {
    const { orgId } = req.params;

    const data = await connectGoogleService(
        req.user._id,
        orgId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Google authorization URL generated successfully."
        )
    );
});


export const googleOAuthCallbackController = asyncHandler(async (req, res) => {
    const { code, state } = req.query;

    const data = await googleOAuthCallbackService(code, state);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Google account connected successfully."
        )
    );
});


export const getGoogleIntegrationStatusController = asyncHandler(async (req, res) => {
    const { orgId } = req.params;

    const data = await getGoogleIntegrationStatusService(
        req.user._id,
        orgId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Google integration status fetched successfully."
        )
    );
});


export const listGoogleCalendarsController = asyncHandler(async (req, res) => {
    const { orgId } = req.params;

    const data = await listGoogleCalendarsService(
        req.user._id,
        orgId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Google calendars fetched successfully."
        )
    );
});


export const disconnectGoogleController = asyncHandler(async (req, res) => {
    const { organizationId } = req.params;

    const data = await disconnectGoogleService(
        req.user._id,
        organizationId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Google account disconnected successfully."
        )
    );
});