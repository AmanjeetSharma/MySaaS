import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    createDealService,
    updateDealService,
    updateDealStatusService,
    getDealByIdService,
    deleteDealService,
    getAllDealsForOrganizationService,
    getDealActivitiesService
} from "./deal.service.js";
import { decodeCursor } from "../../utils/cursor.js";


export const createDealController = asyncHandler(async (req, res) => {
    const { orgId, customerId, title } = req.body;
    const data = await createDealService(
        req.user._id,
        { orgId, customerId, title }
    );

    return res.status(200).json(
        new ApiResponse(
            201,
            data,
            "Deal created successfully"
        ));
});


export const updateDealController = asyncHandler(async (req, res) => {
    const { title, customerId } = req.body;
    const data = await updateDealService(
        req.user._id,
        req.params.dealId,
        req.body.title,
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Deal updated successfully"
        ));
});


export const updateDealStatusController = asyncHandler(async (req, res) => {
    const data = await updateDealStatusService(
        req.user._id,
        req.params.dealId,
        req.body.status
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Deal status updated successfully"
        ));
});


export const getDealByIdController = asyncHandler(async (req, res) => {
    const data = await getDealByIdService(
        req.user._id,
        req.params.dealId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Deal retrieved successfully"
        ));
});


export const deleteDealController = asyncHandler(async (req, res) => {
    const data = await deleteDealService(
        req.user._id,
        req.params.dealId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Deal deleted successfully"
        ));
});


export const getAllDealsForOrganizationController = asyncHandler(async (req, res) => {
    const data = await getAllDealsForOrganizationService(
        req.user._id,
        req.query?.orgId || req.body?.orgId,
        req.query,
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Deals retrieved successfully"
        ));
});


export const getDealActivitiesController = asyncHandler(async (req, res) => {
    const { cursor } = req.query;
    let decodedCursor = null;

    if (cursor) {
        decodedCursor = decodeCursor(cursor);
        if (!decodedCursor) {
            throw new ApiError(400, "Invalid cursor value");
        }
    }
    const data = await getDealActivitiesService(
        req.user._id,
        req.params.dealId,
        decodedCursor
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Deal activities retrieved successfully"
        ));
});


