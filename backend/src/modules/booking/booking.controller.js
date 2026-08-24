import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    cancelBookingService,
    rescheduleBookingService,
    getPublicBookingService,
    publicRescheduleBookingService,
    publicCancelBookingService,
    getBookingByIdService,
    updateBookingService,
    updateBookingStatusService,
    getOrganizationBookingsService,
    getServiceBookingsService,
} from "./booking.service.js";


export const cancelBookingController = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { orgId, cancellationReason, } = req.body;

    const data = await cancelBookingService({
        userId: req.user._id,
        orgId,
        bookingId,
        cancellationReason,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Booking cancelled successfully."
        )
    );
});


export const rescheduleBookingController = asyncHandler(async (req, res) => {
    const { bookingId, } = req.params;
    const { orgId, startTime, } = req.body;

    const data = await rescheduleBookingService({
        userId: req.user._id,
        orgId,
        bookingId,
        startTime,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Booking rescheduled successfully."
        )
    );
});


export const getPublicBookingController = asyncHandler(async (req, res) => {
    const { token } = req.query;

    const data = await getPublicBookingService({ rawToken: token });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Booking details fetched successfully."
        )
    );
});


export const publicRescheduleBookingController = asyncHandler(async (req, res) => {
    const { token } = req.query;
    const { startTime } = req.body;

    const data = await publicRescheduleBookingService({
        rawToken: token,
        startTime,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Booking rescheduled successfully."
        )
    );
});


export const publicCancelBookingController = asyncHandler(async (req, res) => {
    const { token } = req.query;
    const { cancellationReason, } = req.body;

    const data = await publicCancelBookingService({
        rawToken: token,
        cancellationReason,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Booking cancelled successfully."
        )
    );
});


export const getBookingByIdController = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { orgId } = req.query;

    const data = await getBookingByIdService({
        userId: req.user._id,
        orgId,
        bookingId,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Booking fetched successfully."
        )
    );
});


export const updateBookingController = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { orgId } = req.body;

    const data = await updateBookingService({
        userId: req.user._id,
        orgId,
        bookingId,
        payload: req.body,
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
    const { bookingId } = req.params;
    const { orgId, status } = req.body;

    const data = await updateBookingStatusService({
        userId: req.user._id,
        orgId,
        bookingId,
        status,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Booking status updated successfully."
        )
    );
});


export const getOrganizationBookingsController = asyncHandler(async (req, res) => {
    const { page, limit, search, status, sortBy, sortOrder, } = req.query;

    const data = await getOrganizationBookingsService({
        userId: req.user._id,
        orgId: req.params.orgId,
        query: {
            page,
            limit,
            search,
            status,
            sortBy,
            sortOrder,
        }
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Bookings retrieved successfully."
        )
    );
});


export const getServiceBookingsController = asyncHandler(async (req, res) => {
    const { page, limit, search, status, sortBy, sortOrder, } = req.query;

    const data = await getServiceBookingsService({
        userId: req.user._id,
        serviceId: req.params.serviceId,
        query: {
            page,
            limit,
            search,
            status,
            sortBy,
            sortOrder,
        }
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Bookings retrieved successfully."
        )
    );
});