import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
    createBookingService,
    getBookingByIdService,
    getOrganizationBookingsService,
    getServiceBookingsService,
    updateBookingService,
    updateBookingStatusService,
    cancelBookingService,
    deleteBookingService,
} from './booking.service.js';

export const createBookingController = asyncHandler(async (req, res) => {
    const data = await createBookingService(
        req.user._id,
        req.body
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            data,
            "Booking created successfully."
        )
    );
});

export const getBookingByIdController = asyncHandler(async (req, res) => {
    const data = await getBookingByIdService(
        req.user._id,
        req.params.bookingId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Booking fetched successfully."
        )
    );
});

export const getOrganizationBookingsController = asyncHandler(async (req, res) => {
    const data = await getOrganizationBookingsService(
        req.user._id,
        req.params.orgId,
        req.query
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Bookings fetched successfully."
        )
    );
});

export const getServiceBookingsController = asyncHandler(async (req, res) => {
    const data = await getServiceBookingsService(
        req.user._id,
        req.params.serviceId,
        req.query
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Service bookings fetched successfully."
        )
    );
});

export const updateBookingController = asyncHandler(async (req, res) => {
    const data = await updateBookingService(
        req.user._id,
        req.params.bookingId,
        req.body
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Booking updated successfully."
        )
    );
});

export const updateBookingStatusController = asyncHandler(async (req, res) => {
    const data = await updateBookingStatusService(
        req.user._id,
        req.params.bookingId,
        req.body.status
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Booking status updated successfully."
        )
    );
});

export const cancelBookingController = asyncHandler(async (req, res) => {
    const data = await cancelBookingService(
        req.user._id,
        req.params.bookingId,
        req.body.cancellationReason
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Booking cancelled successfully."
        )
    );
});

export const deleteBookingController = asyncHandler(async (req, res) => {
    await deleteBookingService(
        req.user._id,
        req.params.bookingId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Booking deleted successfully."
        )
    );
});