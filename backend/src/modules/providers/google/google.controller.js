import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import env from "../../../config/env.config.js";
import {
    connectGoogleService,
    googleOAuthCallbackService,
    getGoogleIntegrationStatusService,
    listGoogleCalendarsService,
    disconnectGoogleService,
    updateSelectedCalendarService,
} from "./google.service.js";


export const connectGoogleController = asyncHandler(async (req, res) => {
    const { orgId } = req.params;

    const data = await connectGoogleService({
        userId: req.user._id,
        orgId
    });

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

    const redirectBaseUrl = `${env.CLIENT_URL}/integrations/connect-google`;

    try {
        const { email } = await googleOAuthCallbackService({
            code,
            state,
        });

        return res.redirect(
            302,
            `${redirectBaseUrl}?connected=true&email=${encodeURIComponent(email)}`
        );
    } catch (error) {
        return res.redirect(
            302,
            `${redirectBaseUrl}?connected=false&error=oauth_failed`
        );
    }
});


export const updateSelectedCalendarController = asyncHandler(async (req, res) => {
    const { orgId } = req.params;
    const { calendarId } = req.body;

    const data = await updateSelectedCalendarService({
        userId: req.user._id,
        orgId,
        calendarId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Google Calendar updated successfully."
        )
    );
});


export const getGoogleIntegrationStatusController = asyncHandler(async (req, res) => {
    const { orgId } = req.params;

    const data = await getGoogleIntegrationStatusService({
        userId: req.user._id,
        orgId
    });

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

    const data = await listGoogleCalendarsService({
        userId: req.user._id,
        orgId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Google calendars fetched successfully."
        )
    );
});


export const disconnectGoogleController = asyncHandler(async (req, res) => {
    const { orgId } = req.params;

    const data = await disconnectGoogleService({
        userId: req.user._id,
        orgId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Google account disconnected successfully."
        )
    );
});
