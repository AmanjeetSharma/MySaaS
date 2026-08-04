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
    const { serviceId, startTime, timezone, booker } = req.body;
    const data = await createBookingService({
        userId: req.user._id,
        serviceId,
        startTime,
        timezone,
        booker,
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            data,
            "Booking created successfully."
        )
    );
});


export const getBookingByIdController = asyncHandler(async (req, res) => {
    const data = await getBookingByIdService({
        userId: req.user._id,
        bookingId: req.params.bookingId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Booking fetched successfully."
        )
    );
});


export const getOrganizationBookingsController = asyncHandler(async (req, res) => {
    const data = await getOrganizationBookingsService({
        userId: req.user._id,
        orgId: req.params.orgId,
        query: req.query
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Bookings fetched successfully."
        )
    );
});


export const getServiceBookingsController = asyncHandler(async (req, res) => {
    const data = await getServiceBookingsService({
        userId: req.user._id,
        serviceId: req.params.serviceId,
        query: req.query
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Service bookings fetched successfully."
        )
    );
});


export const updateBookingController = asyncHandler(async (req, res) => {
    const data = await updateBookingService({
        userId: req.user._id,
        bookingId: req.params.bookingId,
        updateData: req.body
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Booking updated successfully."
        )
    );
});


export const updateBookingStatusController = asyncHandler(async (req, res) => {
    const data = await updateBookingStatusService({
        userId: req.user._id,
        bookingId: req.params.bookingId,
        status: req.body.status
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Booking status updated successfully."
        )
    );
});


export const cancelBookingController = asyncHandler(async (req, res) => {
    const data = await cancelBookingService({
        userId: req.user._id,
        bookingId: req.params.bookingId,
        cancellationReason: req.body.cancellationReason
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Booking cancelled successfully."
        )
    );
});


export const deleteBookingController = asyncHandler(async (req, res) => {
    await deleteBookingService({
        userId: req.user._id,
        bookingId: req.params.bookingId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Booking deleted successfully."
        )
    );
});