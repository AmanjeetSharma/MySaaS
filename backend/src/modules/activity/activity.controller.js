import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    createActivityService,
    updateActivityService,
    deleteActivityService,
    getActivityByIdService,
    getAllActivitiesService,
} from "./activity.service.js";


export const createActivityController = asyncHandler(async (req, res) => {
    const { dealId, type, event, description, customType } = req.body;
    const data = await createActivityService(
        req.user._id,
        { dealId, type, event, description, customType }
    );

    return res.status(200).json(
        new ApiResponse(
            201,
            data,
            "Activity created successfully"
        ));
});


export const updateActivityController = asyncHandler(async (req, res) => {
    const { type, event, description, customType } = req.body;
    const data = await updateActivityService(
        req.user._id,
        req.params.activityId,
        { type, event, description, customType }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Activity updated successfully"
        ));
});


export const deleteActivityController = asyncHandler(async (req, res) => {
    const data = await deleteActivityService(
        req.user._id,
        req.params.activityId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Activity deleted successfully"
        ));
});


export const getActivityByIdController = asyncHandler(async (req, res) => {
    const data = await getActivityByIdService(
        req.user._id,
        req.params.activityId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Activity retrieved successfully"
        ));
});


export const getAllActivitiesController = asyncHandler(async (req, res) => {
    const { cursor } = req.query;
    const data = await getAllActivitiesService(
        req.user._id,
        { cursor }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Activities fetched successfully"
        ));
});
