import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import {
    findOrganizationById,
    findServiceById,
    findBookingById,
    findOverlappingBooking,
    createBooking,
    findBookingsByOrganization,
    findBookingsByService,
    countBookingsByFilter,
    updateBooking,
    deleteBookingById,
} from "./booking.repository.js";
import {
    validateObjectId,
    validateBookerDetails,
    validateStartTime,
    validateTimezone,
    buildBookingQuery,
    checkOverlappingBooking,
    validateBookingStatus,
    getPaginationOptions,
    validateStatusTransition,
} from "./booking.helper.js";
import {
    ACTIVE_BOOKING_STATUSES,
    BOOKING_STATUSES,
} from "./booking.constants.js";

export const createBookingService = async (userId, payload) => {
    const { serviceId, booker, startTime, timezone, notes } = payload;

    validateObjectId(serviceId, "service ID");
    validateBookerDetails(booker);
    validateStartTime(startTime);
    validateTimezone(timezone);

    const parsedStartTime = new Date(startTime);
    const service = await findServiceById(serviceId);
    
    if (!service) {
        throw new ApiError(404, "Service not found");
    }
    
    if (!service.isActive) {
        throw new ApiError(400, "Service is not active for booking");
    }

    const parsedEndTime = new Date(
        parsedStartTime.getTime() + service.durationInMinutes * 60 * 1000
    );

    await checkOverlappingBooking(serviceId, parsedStartTime, parsedEndTime);

    const bookingData = {
        organization: service.organization,
        service: service._id,
        booker: {
            name: booker.name,
            email: booker.email,
            phone: booker.phone || null,
        },
        serviceSnapshot: {
            name: service.name,
            slug: service.slug,
            durationInMinutes: service.durationInMinutes,
            price: service.price,
            currency: service.currency,
            mode: service.mode,
            address: service.mode === "OFFLINE" ? service.address : null,
        },
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        timezone,
        meetingProvider: service.mode === "ONLINE" ? service.onlineMeetingProvider : null,
        meetingLink: null,
        notes: notes || null,
    };

    const newBooking = await createBooking(bookingData);

    console.log(`Booking created| Service: ${service.name} (ID: ${service._id}) | Booker: ${booker.name} (${booker.email})`);

    return newBooking;
};

















export const getBookingByIdService = async (userId, bookingId) => {
    validateObjectId(bookingId, "booking ID");

    const booking = await findBookingById(bookingId);
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    await checkOrganizationAccess(booking.organization, userId);

    await booking.populate("service", "name slug mode durationInMinutes price currency");

    return booking;
};









export const getOrganizationBookingsService = async (userId, orgId, query) => {
    validateObjectId(orgId, "organization ID");
    await checkOrganizationAccess(orgId, userId);

    const filter = {
        organization: orgId,
        ...buildBookingQuery(query),
    };

    const paginationOptions = getPaginationOptions(query);
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;

    const [bookings, total] = await Promise.all([
        findBookingsByOrganization(filter, paginationOptions, sortOrder),
        countBookingsByFilter(filter),
    ]);

    const result = {
        bookings,
        pagination: {
            page: paginationOptions.page,
            limit: paginationOptions.limit,
            total,
            totalPages: Math.ceil(total / paginationOptions.limit),
        },
    };

    console.log(`Organization bookings fetched| Organization: ${orgId} | Count: ${bookings.length}`);

    return result;
};










export const getServiceBookingsService = async (userId, serviceId, query) => {
    validateObjectId(serviceId, "service ID");

    const service = await findServiceById(serviceId);
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    await checkOrganizationAccess(service.organization, userId);

    const filter = {
        service: serviceId,
        ...buildBookingQuery(query),
    };

    const paginationOptions = getPaginationOptions(query);
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;

    const [bookings, total] = await Promise.all([
        findBookingsByService(filter, paginationOptions, sortOrder),
        countBookingsByFilter(filter),
    ]);

    const result = {
        bookings,
        pagination: {
            page: paginationOptions.page,
            limit: paginationOptions.limit,
            total,
            totalPages: Math.ceil(total / paginationOptions.limit),
        },
    };

    console.log(`Service bookings fetched| Service: ${serviceId} | Count: ${bookings.length}`);

    return result;
};














export const updateBookingService = async (userId, bookingId, payload) => {
    validateObjectId(bookingId, "booking ID");

    const { startTime, timezone, notes, meetingLink } = payload;

    const booking = await findBookingById(bookingId);
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    await checkOrganizationAccess(booking.organization, userId);

    const updateData = {};

    if (startTime !== undefined) {
        const parsedStartTime = new Date(startTime);
        if (Number.isNaN(parsedStartTime.getTime())) {
            throw new ApiError(400, "Invalid start time");
        }
        if (parsedStartTime <= new Date()) {
            throw new ApiError(400, "Booking start time must be in the future");
        }

        const parsedEndTime = new Date(
            parsedStartTime.getTime() + booking.serviceSnapshot.durationInMinutes * 60 * 1000
        );

        await checkOverlappingBooking(booking.service, parsedStartTime, parsedEndTime, bookingId);

        updateData.startTime = parsedStartTime;
        updateData.endTime = parsedEndTime;
    }

    if (timezone !== undefined) updateData.timezone = timezone;
    if (notes !== undefined) updateData.notes = notes || null;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink || null;

    const updatedBooking = await updateBooking(bookingId, updateData);

    console.log(`Booking updated| Booking ID: ${bookingId}`);

    return updatedBooking;
};











export const updateBookingStatusService = async (userId, bookingId, status) => {
    validateObjectId(bookingId, "booking ID");

    const booking = await findBookingById(bookingId);
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    await checkOrganizationAccess(booking.organization, userId);

    validateBookingStatus(status);
    validateStatusTransition(booking.status, status);

    const updateData = {
        status,
        cancelledAt: status === "CANCELLED" ? new Date() : null,
        completedAt: status === "COMPLETED" ? new Date() : null,
    };

    const updatedBooking = await updateBooking(bookingId, updateData);

    console.log(`Booking status updated| Booking ID: ${bookingId} | Status: ${status}`);

    return updatedBooking;
};

export const cancelBookingService = async (userId, bookingId, cancellationReason) => {
    validateObjectId(bookingId, "booking ID");

    const booking = await findBookingById(bookingId);
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    await checkOrganizationAccess(booking.organization, userId);

    if (booking.status === "CANCELLED") {
        throw new ApiError(400, "Booking is already cancelled");
    }

    const updateData = {
        status: "CANCELLED",
        cancellationReason: cancellationReason || null,
        cancelledAt: new Date(),
        completedAt: null,
    };

    const cancelledBooking = await updateBooking(bookingId, updateData);

    console.log(`Booking cancelled| Booking ID: ${bookingId} | Reason: ${cancellationReason || "No reason provided"}`);

    return cancelledBooking;
};










export const deleteBookingService = async (userId, bookingId) => {
    validateObjectId(bookingId, "booking ID");

    const booking = await findBookingById(bookingId);
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    await checkOrganizationAccess(booking.organization, userId);

    await deleteBookingById(bookingId);

    console.log(`Booking deleted| Booking ID: ${bookingId}`);
};










// Helper function to check organization access
const checkOrganizationAccess = async (orgId, userId) => {
    const organization = await findOrganizationById(orgId);
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    const isOwner = organization.owner.toString() === userId.toString();
    const isMember = organization.members.some(
        (member) => member.user.toString() === userId.toString()
    );

    if (!isOwner && !isMember) {
        throw new ApiError(403, "Access denied. You can not perform this action on an organization you do not belong to");
    }

    return organization;
};