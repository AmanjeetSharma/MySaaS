import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import env from "../../../config/env.config.js";
import {
    connectZoomService,
    zoomOAuthCallbackService,
    getZoomIntegrationStatusService,
    disconnectZoomService,
} from "./zoom.service.js";


export const connectZoomController = asyncHandler(async (req, res) => {
    const { orgId } = req.params;

    const data = await connectZoomService({
        userId: req.user._id,
        orgId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Zoom authorization URL generated successfully."
        )
    );
});


export const zoomOAuthCallbackController = asyncHandler(async (req, res) => {
    const { code, state } = req.query;

    const redirectBaseUrl = `${env.CLIENT_URL}/integrations/zoom`;

    try {
        const { email } = await zoomOAuthCallbackService({
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


export const getZoomIntegrationStatusController = asyncHandler(async (req, res) => {
    const { orgId } = req.params;

    const data = await getZoomIntegrationStatusService({
        userId: req.user._id,
        orgId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Zoom integration status retrieved successfully."
        )
    );
});


export const disconnectZoomController = asyncHandler(async (req, res) => {
    const { orgId } = req.params;

    const data = await disconnectZoomService({
        userId: req.user._id,
        orgId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Zoom integration disconnected successfully."
        )
    );
});
