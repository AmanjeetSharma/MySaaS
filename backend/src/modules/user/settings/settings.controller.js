import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { updateThemeService, updateTimezoneService, updateNotificationsService } from "./settings.service.js";


export const updateThemeController = asyncHandler(async (req, res) => {
    const data = await updateThemeService(req.user._id, req.body.theme);

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
            "Timezone updated successfully."
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