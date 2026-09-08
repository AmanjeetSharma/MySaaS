import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    getNotificationsService,
    markSelectedNotificationsAsReadService,
    markAllNotificationsAsReadService,
    deleteSelectedNotificationsService,
    deleteAllNotificationsService,
} from "./notification.service.js";


export const getNotificationsController = asyncHandler(async (req, res) => {
    const data = await getNotificationsService({
        userId: req.user._id,
        limit: req.query.limit,
        cursor: req.query.cursor,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Notifications retrieved successfully."
        )
    );
});


export const markSelectedNotificationsAsReadController = asyncHandler(async (req, res) => {
    const data = await markSelectedNotificationsAsReadService({
        userId: req.user._id,
        notificationIds: req.body.notificationIds,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Selected notifications marked as read."
        )
    );
});


export const markAllNotificationsAsReadController = asyncHandler(async (req, res) => {
    const data = await markAllNotificationsAsReadService({
        userId: req.user._id,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "All notifications marked as read."
        )
    );
});


export const deleteSelectedNotificationsController = asyncHandler(async (req, res) => {
    const data = await deleteSelectedNotificationsService({
        userId: req.user._id,
        notificationIds: req.body.notificationIds,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Selected notifications deleted successfully."
        )
    );
});


export const deleteAllNotificationsController = asyncHandler(async (req, res) => {
    const data = await deleteAllNotificationsService({
        userId: req.user._id,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "All notifications deleted successfully."
        )
    );
});