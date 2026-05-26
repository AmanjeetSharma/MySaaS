import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import {
    // createCustomerService,
    // updateCustomerService,
    // getCustomerService,
    // removeCustomerService,
    // getAllCustomersOfOrganizationService
    // getCustomerHistoryService,
    // getCustomerDealsService,
    // getCustomerAppointmentsService
} from "./customer.service.js";



export const createCustomerController = asyncHandler(async (req, res) => {
    const data = await createCustomerService(
        req.user._id,
        req.body
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            data,
            "Customer created successfully"
        ));
});


export const updateCustomerController = asyncHandler(async (req, res) => {
    const data = await updateCustomerService(
        req.user._id,
        req.body
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Customer updated successfully"
        ));
});


export const getCustomerController = asyncHandler(async (req, res) => {
    const data = await getCustomerService(
        req.user._id,
        req.params.customerId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Customer retrieved successfully"
        ));
});


export const removeCustomerController = asyncHandler(async (req, res) => {
    await removeCustomerService(
        req.user._id,
        req.params.customerId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Customer removed successfully"
        ));
});


export const getAllCustomersOfOrganizationController = asyncHandler(async (req, res) => {
    const data = await getAllCustomersOfOrganizationService(
        req.user._id,
        req.query
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Customers retrieved successfully"
        ));
});


export const getCustomerHistoryController = asyncHandler(async (req, res) => {
    const data = await getCustomerHistoryService(
        req.user._id,
        req.params.customerId,
        req.query
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Customer history retrieved successfully"
        ));
});


export const getCustomerDealsController = asyncHandler(async (req, res) => {
    const data = await getCustomerDealsService(
        req.user._id,
        req.params.customerId,
        req.query
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Customer deals retrieved successfully"
        ));
});


export const getCustomerAppointmentsController = asyncHandler(async (req, res) => {
    const data = await getCustomerAppointmentsService(
        req.user._id,
        req.params.customerId,
        req.query
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Customer appointments retrieved successfully"
        ));
});