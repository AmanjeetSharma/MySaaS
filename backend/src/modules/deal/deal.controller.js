import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import {
    createDealService,
    // getAllDealsService,
    // getDealByIdService,
    // updateDealService,
    // deleteDealService,
    // updateDealStatusService,
    // getDealTimelineService,
    // getDealActivitiesService
} from "./deal.service.js";


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
    await deleteDealService(
        req.user._id,
        req.params.dealId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Deal deleted successfully"
        ));
});

// all deals of
export const getAllDealsController = asyncHandler(async (req, res) => {
    const data = await getAllDealsService(
        req.user._id,
        req.query,
        req.body.orgId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Deals retrieved successfully"
        ));
});


export const getDealTimelineController = asyncHandler(async (req, res) => {
    const data = await getDealTimelineService(
        req.user._id,
        req.params.dealId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Deal timeline retrieved successfully"
        ));
});


export const getDealActivitiesController = asyncHandler(async (req, res) => {
    const data = await getDealActivitiesService(
        req.user._id,
        req.params.dealId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Deal activities retrieved successfully"
        ));
});


