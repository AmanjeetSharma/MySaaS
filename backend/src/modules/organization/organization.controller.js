import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    createOrganizationService,
    getOrganizationsService,
    getOrganizationService,
    updateOrganizationService,
    deleteOrganizationService,
    switchOrganizationService
} from "./organization.service.js";


export const createOrganizationController = asyncHandler(async (req, res) => {
    const data = await createOrganizationService(req.user._id, req.body.orgName);

    return res.status(201).json(
        new ApiResponse(
            201,
            data,
            "Organization created successfully"
        ));
});


export const getOrganizationsController = asyncHandler(async (req, res) => {
    const data = await getOrganizationsService(req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Organizations retrieved successfully"
        ));
});


export const getOrganizationController = asyncHandler(async (req, res) => {
    const data = await getOrganizationService(req.params.orgId, req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Organization retrieved successfully"
        ));
});


export const updateOrganizationController = asyncHandler(async (req, res) => {
    const data = await updateOrganizationService(req.params.orgId, req.body, req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Organization updated successfully"
        ));
});


export const deleteOrganizationController = asyncHandler(async (req, res) => {
    await deleteOrganizationService(req.user._id, req.params.orgId);

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Organization deleted successfully"
        ));
});


export const switchOrganizationController = asyncHandler(async (req, res) => {
    const data = await switchOrganizationService(req.user._id, req.params.orgId);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Switched active organization successfully"
        ));
});