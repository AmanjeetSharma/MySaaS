import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
    updateThemeService,
    updateTimezoneService,
    updateNotificationsService,
    getSettingsService
} from "./settings.service.js";


export const updateThemeController = asyncHandler(async (req, res) => {
    const data = await updateThemeService(req.user._id, req.body.theme.name, req.body.theme.mode);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "Theme updated successfully."
        ))
});


export const updateTimezoneController = asyncHandler(async (req, res) => {
    const data = await updateTimezoneService(req.user._id, req.body.timezone);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            data.message
        ))
});


export const updateNotificationsController = asyncHandler(async (req, res) => {
    const data = await updateNotificationsService(req.user._id, req.body.notifications);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "Notification preferences updated successfully."
        ))
});


export const getSettingsController = asyncHandler(async (req, res) => {
    const data = await getSettingsService(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            data,
            "User settings retrieved successfully."
        ))
});