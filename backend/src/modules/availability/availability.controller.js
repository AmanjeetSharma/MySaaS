import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
    createAvailabilityService,
    updateAvailabilityService,
    getAvailabilityByServiceIdService,
    deleteAvailabilityService,
} from "./availability.service.js";




export const createAvailabilityController = asyncHandler(async (req, res) => {
    const data = await createAvailabilityService(
        req.user._id,
        req.params.serviceId,
        req.body
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            data,
            "Availability created successfully."
        )
    );
});


export const updateAvailabilityController = asyncHandler(async (req, res) => {
    const data = await updateAvailabilityService(
        req.user._id,
        req.params.serviceId,
        req.body
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Availability updated successfully."
        )
    );
});


export const getAvailabilityByServiceIdController = asyncHandler(async (req, res) => {
    const data = await getAvailabilityByServiceIdService(
        req.user._id,
        req.params.serviceId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Availability fetched successfully."
        )
    );
});


export const deleteAvailabilityController = asyncHandler(async (req, res) => {
    const data = await deleteAvailabilityService(
        req.user._id,
        req.params.serviceId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Availability deleted successfully."
        )
    );
});