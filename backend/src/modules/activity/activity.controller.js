import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import {
    // createActivityService,
    // updateActivityService,
    // deleteActivityService
    // getAllActivitiesService,
    // getActivityByIdService,
} from "./activity.service.js";


export const createActivityController = asyncHandler(async (req, res) => {
    const data = await createActivityService(req.user._id, req.body);

    return res.status(200).json(
        new ApiResponse(
            201,
            data,
            "Activity created successfully"
        ));
});


export const updateActivityController = asyncHandler(async (req, res) => {
    const data = await updateActivityService(req.user._id, req.params.activityId, req.body);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Activity updated successfully"
        ));
});


export const deleteActivityController = asyncHandler(async (req, res) => {
    await deleteActivityService(req.user._id, req.params.activityId);

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Activity deleted successfully"
        ));
});


export const getAllActivitiesController = asyncHandler(async (req, res) => {
    const data = await getAllActivitiesService(req.user._id, req.query);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Activities fetched successfully"
        ));
});


export const getActivityByIdController = asyncHandler(async (req, res) => {
    const data = await getActivityByIdService(req.user._id, req.params.activityId);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Activity fetched successfully"
        ));
});


