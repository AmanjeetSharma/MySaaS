import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

import {
    createServiceService,
    updateServiceService,
    deleteServiceService,
    getServiceByIdService,
    getServiceBySlugService,
    getOrganizationServicesService,
    toggleServiceStatusService,
    toggleAutoGenerateMeetingLinkService,
    syncServiceSlugService,
    getPublicServiceUrlService,
} from "./service.service.js";


export const createServiceController = asyncHandler(async (req, res) => {
    const data = await createServiceService(
        req.user._id,
        req.body.organizationId,
        req.body
    )

    return res.status(201).json(
        new ApiResponse(
            201,
            data,
            "Service created successfully."
        )
    );
})


export const updateServiceController = asyncHandler(async (req, res) => {
    const data = await updateServiceService(
        req.user._id,
        req.params.serviceId,
        req.body
    )
    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Service updated successfully."
        )
    );
});


export const deleteServiceController = asyncHandler(async (req, res) => {
    await deleteServiceService(
        req.user._id,
        req.params.serviceId
    )
    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Service deleted successfully."
        )
    );
});


export const getServiceByIdController = asyncHandler(async (req, res) => {
    const data = await getServiceByIdService(
        req.params.serviceId
    )
    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Service fetched successfully."
        )
    );
});


export const getOrganizationServicesController = asyncHandler(async (req, res) => {
    const data = await getOrganizationServicesService(
        req.params.orgId
    )
    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Services fetched successfully."
        )
    );
});


export const getServiceBySlugController = asyncHandler(async (req, res) => {
    const data = await getServiceBySlugService(
        req.params.orgSlug,
        req.params.serviceSlug
    )
    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Service fetched successfully."
        )
    );
});


export const toggleServiceStatusController = asyncHandler(async (req, res) => {
    const data = await toggleServiceStatusService(
        req.params.serviceId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            `Service ${data.isActive ? "activated" : "deactivated"} successfully.`
        )
    );
});


export const toggleAutoGenerateMeetingLinkController = asyncHandler(async (req, res) => {
    const data = await toggleAutoGenerateMeetingLinkService(
        req.user._id,
        req.params.serviceId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            `Auto-generate meeting link ${data.autoGenerateMeetingLink ? "enabled" : "disabled"} successfully.`
        )
    );
});


export const syncServiceSlugController = asyncHandler(async (req, res) => {
    const data = await syncServiceSlugService(
        req.user._id,
        req.params.serviceId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Service slug synchronized successfully."
        )
    );
});


export const getPublicServiceUrlController = asyncHandler(async (req, res) => {
    const data = await getPublicServiceUrlService(
        req.params.serviceId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Public service URL fetched successfully."
        )
    );
});