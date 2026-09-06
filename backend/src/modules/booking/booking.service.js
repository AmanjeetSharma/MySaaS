import { ApiError } from "../../utils/ApiError.js";
import {
    createBooking,
    findAvailabilityByServiceId,
    findOrganizationBySlug,
    findOverlappingOrganizationBooking,
    findServiceBySlug,
    findBookingByIdAndOrganization,
    cancelBooking,
    findOrganizationById,
    updateBookingSchedule,
    findBookingByAccessToken,
    findBookingByIdAndOrg,
    updateBooking,
    updateBookingStatus,
    findBookings,
    countBookings,
    findServiceById,
    findServiceForPublicBooking,
    findBookingById,
    findActivePendingBooking,
} from "./booking.repository.js";
import {
    validateObjectId,
    validateBookerDetails,
    validateStartTime,
    generateBookingAccessToken,
    normalizeSlug,
    validateRequestedSlot,
    handleBookingConflict,
    validateNotSameBookingTime,
    buildServiceSnapshot,
    shouldCreateGoogleCalendarEvent,
    shouldGenerateGoogleMeet,
    buildServiceLocation,
    buildManageBookingUrl,
    sendBookingEmails,
    validateCancellation,
    validateRescheduling,
    hashBookingAccessToken,
    validateBookingAccess,
    validateBookingUpdate,
    validateBookingStatusTransition,
    getPagination,
} from "./booking.helper.js";
import { decryptRefreshToken } from "../providers/google/google.utils.js";
import {
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
} from "../providers/google/services/calendar.service.js";
import { checkOrganizationAccess } from "../organization/organization.access.js";
import { PAYMENT_HOLD_DURATION_MINUTES, BOOKING_STATUSES } from "./booking.constants.js";
import logger from "#/config/logger.js";










const tryCreateGoogleEvent = async ({
    organization,
    service,
    booker,
    startTime,
    endTime,
    timezone,
    manageBookingUrl,
}) => {
    if (!shouldCreateGoogleCalendarEvent(organization)) {
        return {
            meeting: {
                provider: service.mode === "ONLINE"
                    ? service.meetingProvider
                    : null,
                link: null,
            },
            calendarEvent: {},
        };
    }


    try {
        const refreshToken =
            decryptRefreshToken(
                organization.integrations.google.refreshToken
            );

        const calendarId = organization.integrations.google.calendarId;

        const generateMeetLink = shouldGenerateGoogleMeet(service);

        const location = buildServiceLocation(service);

        const event = await createCalendarEvent({
            refreshToken,
            calendarId,

            summary: `${service.name} with ${booker.name}`,

            description: [
                `Booking for ${service.name}`,
                `Booker: ${booker.name} <${booker.email}>`,

                manageBookingUrl
                    ? `Manage booking: ${manageBookingUrl}`
                    : null,
            ]
                .filter(Boolean)
                .join("\n"),

            location,

            startTime: startTime.toISOString(),

            endTime: endTime.toISOString(),

            timeZone: timezone,

            attendees: [
                {
                    email: booker.email,
                    displayName: booker.name,
                },
            ],

            generateMeetLink,

            sendUpdates: "all",
        });

        return {
            meeting: {
                provider: service.mode === "ONLINE"
                    ? service.meetingProvider
                    : null,

                link: generateMeetLink
                    ? event.meetLink
                    : null,
            },

            calendarEvent: {
                provider: "GOOGLE",
                calendarId,
                eventId: event.eventId,
                htmlLink: event.htmlLink,
            },
        };

    } catch (error) {

        logger.error(
            {
                error: error.message,
            },
            "booking.google_calendar_event_creation_failed"
        );

        return {
            meeting: {
                provider: service.mode === "ONLINE"
                    ? service.meetingProvider
                    : null,

                link: null,
            },
            calendarEvent: {},
        };
    }
};
















export const createPendingBookingService = async (payload = {}) => {
    const organizationSlug = normalizeSlug(payload.organizationSlug, "Organization slug");
    const serviceSlug = normalizeSlug(payload.serviceSlug, "Service slug");

    validateBookerDetails(payload.booker);

    const startTime = validateStartTime(payload.startTime);

    const organization = await findOrganizationBySlug(organizationSlug);
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    const service = await findServiceBySlug(organization._id, serviceSlug);
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    if (!service.isActive) {
        throw new ApiError(400, "Service is not accepting bookings at the moment.");
    }

    const availability = await findAvailabilityByServiceId(service._id);
    if (!availability) {
        throw new ApiError(400, "Bookings are currently unavailable");
    }
    const timezone = availability.timezone;

    const endTime = validateRequestedSlot({
        startTime,
        availability,
        durationInMinutes: service.durationInMinutes,
    });

    const booker = {
        name: payload.booker.name.trim(),
        email: payload.booker.email.trim().toLowerCase(),
        phone: payload.booker.phone?.trim() || null,
    };

    const paymentExpiresAt = new Date(Date.now() + PAYMENT_HOLD_DURATION_MINUTES * 60 * 1000);//if env = 5 then paymentExpiresAt = current time + 5 minutes

    const existingPendingBooking = await findActivePendingBooking({
        organizationId: organization._id,
        serviceId: service._id,
        startTime,
        endTime,
        bookerEmail: booker.email,
    });

    if (existingPendingBooking) {
        logger.info(
            {
                bookingId: existingPendingBooking._id,
                email: booker.email,
                paymentExpiresAt: existingPendingBooking.paymentExpiresAt.toISOString(),
            },
            "booking.pending_booking_exists"
        );

        return {
            booking: existingPendingBooking,
            bookingId: existingPendingBooking._id,
            amount: existingPendingBooking.serviceSnapshot.price,
            currency: existingPendingBooking.serviceSnapshot.currency,
            paymentExpiresAt: existingPendingBooking.paymentExpiresAt,
            isExisting: true,
        };
    }

    const conflictingBooking = await findOverlappingOrganizationBooking(organization._id, startTime, endTime);

    if (conflictingBooking) {
        handleBookingConflict(conflictingBooking);
    }

    let booking;

    try {
        booking = await createBooking({
            organization: organization._id,
            service: service._id,
            booker,
            serviceSnapshot: buildServiceSnapshot(service),
            startTime,
            endTime,
            timezone,

            status: "PENDING_PAYMENT",
            paymentExpiresAt,

            notes: payload.notes?.trim() || null,
        });

    } catch (error) {
        logger.error(
            {
                error: error.message,
            },
            "booking.pending_booking_creation_failed"
        );

        throw new ApiError(500, "Unable to create booking. Please try again.");
    }

    logger.info(
        {
            bookingId: booking._id,
            email: booking.booker.email,
            paymentExpiresAt: paymentExpiresAt.toISOString(),
        },
        "booking.pending_booking_created"
    );

    return {
        booking,
        bookingId: booking._id,
        amount: service.price,
        currency: service.currency,
        paymentExpiresAt,
        isExisting: false,
    };
};








export const confirmBookingService = async ({
    bookingId,
}) => {

    const booking = await findBookingById(bookingId);
    if (!booking) {
        throw new ApiError(404, "Booking not found.");
    }

    if (booking.status === "CONFIRMED") {
        return booking;
    }

    if (booking.status !== "PENDING_PAYMENT") {
        throw new ApiError(409, "Booking is no longer awaiting payment.");
    }

    const organization = await findOrganizationById(booking.organization);
    if (!organization) {
        throw new ApiError(404, "Organization not found.");
    }

    const service = booking.serviceSnapshot;
    if (!service) {
        throw new ApiError(404, "Service not found.");
    }

    const accessToken = generateBookingAccessToken();
    const manageBookingUrl = buildManageBookingUrl(accessToken.rawToken);

    const googleResult = await tryCreateGoogleEvent({
        organization,
        service,
        booker: booking.booker,
        startTime: booking.startTime,
        endTime: booking.endTime,
        timezone: booking.timezone,
        manageBookingUrl,
    });

    const confirmedBooking = await updateBookingStatus(
        booking._id,
        booking.organization,
        "CONFIRMED",
        {
            meeting: googleResult.meeting,
            calendarEvent: googleResult.calendarEvent,
            paymentExpiresAt: null,
            bookingAccess: {
                hashedToken: accessToken.hashedToken,
                expiresAt: accessToken.expiresAt,
            },
        }
    );
    if (!confirmedBooking) {
        throw new ApiError(409, "Booking could not be confirmed. Your money will be refunded within 1 hour, if the payment was already processed.");
    }

    logger.info(
        {
            bookingId: confirmedBooking._id,
            email: confirmedBooking.booker.email,
            accessTokenExpiresAt: confirmedBooking.bookingAccess.expiresAt.toISOString(),
        },
        "booking.confirmed"
    );

    await sendBookingEmails({
        booking: confirmedBooking,
        organization,
        manageBookingUrl,
    });

    return confirmedBooking;
};




















export const cancelBookingService = async ({
    userId,
    orgId,
    bookingId,
    cancellationReason,
}) => {
    validateObjectId(orgId, "Organization ID");
    validateObjectId(bookingId, "Booking ID");

    await checkOrganizationAccess(userId, orgId);

    const booking = await findBookingByIdAndOrganization(bookingId, orgId);

    validateCancellation(booking);

    if (
        booking.calendarEvent?.provider === "GOOGLE" &&
        booking.calendarEvent?.calendarId &&
        booking.calendarEvent?.eventId
    ) {
        const organization = await findOrganizationById(orgId);

        if (
            organization?.integrations?.google?.isConnected &&
            organization.integrations.google?.refreshToken?.encryptedData
        ) {
            try {
                const refreshToken = decryptRefreshToken(organization.integrations.google.refreshToken);

                await deleteCalendarEvent({
                    refreshToken,
                    calendarId: booking.calendarEvent.calendarId,
                    eventId: booking.calendarEvent.eventId,
                    sendUpdates: "all",
                });
            } catch (error) {
                logger.error(
                    {
                        bookingId: booking._id,
                        email: booking.booker.email,
                        error: error.message,
                    },
                    "booking.google_calendar_event_deletion_failed"
                );

                throw new ApiError(500, "We encountered an error while cancelling the booking. Please try again later.");
            }
        }
    }

    const cancelledBooking = await cancelBooking(bookingId, cancellationReason?.trim() || null, userId);
    if (!cancelledBooking) {
        throw new ApiError(409, "Booking could not be cancelled.");
    }

    logger.info(
        {
            bookingId: cancelledBooking._id,
            name: cancelledBooking.booker.name,
            email: cancelledBooking.booker.email,
            cancelledAt: cancelledBooking.cancelledAt,
        },
        "booking.cancelled"
    );

    return cancelledBooking;
};









export const rescheduleBookingService = async ({
    userId,
    orgId,
    bookingId,
    startTime,
}) => {

    validateObjectId(orgId, "Organization ID");
    validateObjectId(bookingId, "Booking ID");

    await checkOrganizationAccess(userId, orgId);
    const booking = await findBookingByIdAndOrganization(bookingId, orgId);


    validateRescheduling(booking);

    const newStartTime = validateStartTime(startTime);

    const organization = await findOrganizationById(orgId);
    if (!organization) {
        throw new ApiError(404, "Organization not found.");
    }

    const availability = await findAvailabilityByServiceId(booking.service);
    if (!availability) {
        throw new ApiError(400, "Bookings are currently unavailable for this service.");
    }

    const newEndTime = validateRequestedSlot({
        startTime: newStartTime,
        availability,
        durationInMinutes: booking.serviceSnapshot.durationInMinutes,
    });

    validateNotSameBookingTime({
        booking,
        newStartTime,
        newEndTime
    });

    const conflictingBooking = await findOverlappingOrganizationBooking(orgId, newStartTime, newEndTime, bookingId);
    if (conflictingBooking) {
        throw new ApiError(409, "The requested time slot is already booked.");
    }

    let googleCalendarResult;

    const calendarEvent = booking.calendarEvent;

    if (
        calendarEvent?.provider === "GOOGLE" &&
        calendarEvent?.calendarId &&
        calendarEvent?.eventId
    ) {

        const googleIntegration = organization.integrations?.google;

        if (
            !googleIntegration?.isConnected ||
            !googleIntegration?.refreshToken?.encryptedData
        ) {
            throw new ApiError(400, "Google Calendar integration is no longer available for this booking.");
        }

        try {
            const refreshToken = decryptRefreshToken(googleIntegration.refreshToken);

            googleCalendarResult = await updateCalendarEvent({
                refreshToken,
                calendarId: calendarEvent.calendarId,

                eventId: calendarEvent.eventId,

                summary: `${booking.serviceSnapshot.name} with ${booking.booker.name}`,

                description: [
                    `Booking for ${booking.serviceSnapshot.name}`,
                    `Booker: ${booking.booker.name} <${booking.booker.email}>`,
                ].join("\n"),

                startTime: newStartTime.toISOString(),

                endTime: newEndTime.toISOString(),

                timeZone: availability.timezone,

                attendees: [
                    {
                        email: booking.booker.email,
                        displayName: booking.booker.name,
                    },
                ],

                sendUpdates: "all",
            });
        } catch (error) {
            logger.error(
                {
                    bookingId: booking._id,
                    email: booking.booker.email,
                    error: error.message,
                },
                "booking.google_calendar_event_update_failed"
            );

            throw new ApiError(500, "We encountered an error while rescheduling the booking. Please try again later.");
        }
    }

    const updatedBooking = await updateBookingSchedule({
        bookingId,
        startTime: newStartTime,
        endTime: newEndTime,
        timezone: availability.timezone,
    });

    if (!updatedBooking) {
        throw new ApiError(409, "Booking could not be rescheduled.");
    }


    if (googleCalendarResult) {

        updatedBooking.calendarEvent = {

            ...updatedBooking.calendarEvent,
            eventId: googleCalendarResult.eventId,
            htmlLink: googleCalendarResult.htmlLink,

        };

        if (googleCalendarResult.meetLink) {

            updatedBooking.meeting = {
                ...updatedBooking.meeting,
                link: googleCalendarResult.meetLink,
            };

        }

        await updatedBooking.save();
    }

    logger.info(
        {
            bookingId: updatedBooking._id,
            name: updatedBooking.booker.name,
            email: updatedBooking.booker.email,
            newStartTime: updatedBooking.startTime,
            newEndTime: updatedBooking.endTime,
        },
        "booking.rescheduled"
    );

    return updatedBooking;
};










export const getPublicBookingService = async ({ rawToken }) => {
    const hashedToken = hashBookingAccessToken(rawToken);

    const booking = await findBookingByAccessToken(hashedToken);

    validateBookingAccess(booking);

    const service = await findServiceForPublicBooking(booking.service);
    if (!service) {
        throw new ApiError(404, "Service not found.");
    }

    const availability = await findAvailabilityByServiceId(service._id);

    const hasBookableAvailability = Object.values(availability?.days ?? {}).some(
        day => day.enabled && Array.isArray(day.slots) && day.slots.length > 0
    );

    const isServiceActive = service.isActive;

    const isServiceBookable =
        isServiceActive &&
        hasBookableAvailability &&
        (
            service.mode === "ONLINE" ||
            (
                service.mode === "OFFLINE" &&
                Boolean(service.address)
            )
        );

    const isBookingManageable = !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(booking.status);

    const canReschedule = isBookingManageable && isServiceBookable;
    const canCancel = isBookingManageable;

    logger.info(
        {
            bookingId: booking._id,
            name: booking.booker.name,
            email: booking.booker.email,
        },
        "booking.details.fetched"
    );

    return {
        organization: {
            name: booking.organization?.name,
        },

        service: {
            name: booking.serviceSnapshot?.name,
            durationInMinutes: booking.serviceSnapshot?.durationInMinutes,
            mode: booking.serviceSnapshot?.mode,
            price: booking.serviceSnapshot?.price,
            currency: booking.serviceSnapshot?.currency,
        },

        booker: {
            name: booking.booker.name,
            email: booking.booker.email,
            phone: booking.booker.phone,
        },

        booking: {
            startTime: booking.startTime,
            endTime: booking.endTime,
            timezone: booking.timezone,
            status: booking.status,
            notes: booking.notes ?? null,
        },

        meeting: {
            provider: booking.meeting?.provider ?? null,
            link: booking.meeting?.link ?? null,
        },


        cancellation: {
            reason: booking.cancellationReason ?? null,
            cancelledAt: booking.cancelledAt ?? null,
        },

        permissions: {
            canReschedule,
            canCancel,
        },

        rescheduling: {
            available: canReschedule,

            availability: canReschedule && availability
                ? {
                    timezone: availability.timezone,
                    days: availability.days,
                }
                : null,
        },

        access: {
            expiresAt: booking.bookingAccess.expiresAt,
        },
    };
};












export const publicRescheduleBookingService = async ({
    rawToken,
    startTime,
}) => {

    const hashedToken = hashBookingAccessToken(rawToken);

    const booking = await findBookingByAccessToken(hashedToken);
    if (!booking) {
        throw new ApiError(404, "Invalid or expired booking link.");
    }

    validateBookingAccess(booking);
    validateRescheduling(booking);

    const newStartTime = validateStartTime(startTime);

    const organization = await findOrganizationById(booking.organization);
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    const availability = await findAvailabilityByServiceId(booking.service);
    if (!availability) {
        throw new ApiError(400, "Bookings are currently unavailable for this service.");
    }

    const newEndTime = validateRequestedSlot({
        startTime: newStartTime,
        availability,
        durationInMinutes: booking.serviceSnapshot.durationInMinutes,
    });

    validateNotSameBookingTime({
        booking,
        newStartTime,
        newEndTime
    });

    const conflictingBooking = await findOverlappingOrganizationBooking(booking.organization, newStartTime, newEndTime, booking._id);
    if (conflictingBooking) {
        throw new ApiError(409, "The requested time slot is already booked.");
    }

    let googleCalendarResult = null;

    const calendarEvent = booking.calendarEvent;

    if (
        calendarEvent?.provider === "GOOGLE" &&
        calendarEvent?.calendarId &&
        calendarEvent?.eventId
    ) {

        const googleIntegration = organization.integrations?.google;

        if (
            !googleIntegration?.isConnected ||
            !googleIntegration?.refreshToken?.encryptedData
        ) {
            throw new ApiError(400, "Google Calendar integration is no longer available for this booking.");
        }

        try {

            const refreshToken = decryptRefreshToken(googleIntegration.refreshToken);

            googleCalendarResult = await updateCalendarEvent({
                refreshToken,
                calendarId: calendarEvent.calendarId,
                eventId: calendarEvent.eventId,
                summary: `${booking.serviceSnapshot.name} with ${booking.booker.name}`,

                description: [
                    `Booking for ${booking.serviceSnapshot.name}`,
                    `Booker: ${booking.booker.name} <${booking.booker.email}>`,
                ].join("\n"),

                startTime: newStartTime.toISOString(),
                endTime: newEndTime.toISOString(),
                timeZone: availability.timezone,
                attendees: [
                    {
                        email: booking.booker.email,
                        displayName: booking.booker.name,
                    },
                ],

                sendUpdates: "all",
            });

        } catch (error) {
            logger.error(
                {
                    bookingId: booking._id,
                    email: booking.booker.email,
                    error: error.message,
                },
                "booking.google_calendar_event_update_failed"
            );
            throw new ApiError(500, "Booking could not be rescheduled because the Google Calendar event could not be updated.");
        }
    }

    const updatedBooking = await updateBookingSchedule({
        bookingId: booking._id,
        startTime: newStartTime,
        endTime: newEndTime,
        timezone: availability.timezone,
    });

    if (!updatedBooking) {
        throw new ApiError(409, "Booking could not be rescheduled.");
    }


    if (googleCalendarResult) {

        updatedBooking.calendarEvent = {
            ...updatedBooking.calendarEvent,
            eventId: googleCalendarResult.eventId,
            htmlLink: googleCalendarResult.htmlLink,
        };

        if (googleCalendarResult.meetLink) {

            updatedBooking.meeting = {
                ...updatedBooking.meeting,
                link: googleCalendarResult.meetLink,
            };
        }

        await updatedBooking.save();
    }

    logger.info(
        {
            name: updatedBooking.booker.name,
            email: updatedBooking.booker.email,
            startTime: updatedBooking.startTime.toISOString(),
            endTime: updatedBooking.endTime.toISOString(),
        },
        "booking.rescheduled"
    );

    return {
        bookingId: updatedBooking._id,
        startTime: updatedBooking.startTime,
        endTime: updatedBooking.endTime,
        timezone: updatedBooking.timezone,
        meeting: updatedBooking.meeting,
    };
};











export const publicCancelBookingService = async ({
    rawToken,
    cancellationReason,
}) => {

    const hashedToken = hashBookingAccessToken(rawToken);

    const booking = await findBookingByAccessToken(hashedToken);

    validateBookingAccess(booking);
    validateCancellation(booking);

    const organization = await findOrganizationById(booking.organization);

    if (!organization) {
        throw new ApiError(404, "Organization not found.");
    }

    const calendarEvent = booking.calendarEvent;

    if (
        calendarEvent?.provider === "GOOGLE" &&
        calendarEvent?.calendarId &&
        calendarEvent?.eventId
    ) {
        const googleIntegration = organization.integrations?.google;

        if (
            !googleIntegration?.isConnected ||
            !googleIntegration?.refreshToken?.encryptedData
        ) {
            throw new ApiError(400, "Google Calendar integration is no longer available for this booking.");
        }

        try {
            const refreshToken = decryptRefreshToken(googleIntegration.refreshToken);

            await deleteCalendarEvent({
                refreshToken,
                calendarId: calendarEvent.calendarId,
                eventId: calendarEvent.eventId,

                sendUpdates: "all",
            });

        } catch (error) {
            logger.error(
                {
                    bookingId: booking._id,
                    email: booking.booker.email,
                    error: error.message,
                },
                "booking.google_calendar_event_deletion_failed"
            );

            throw new ApiError(500, "We encountered an error while cancelling the booking. Please try again later..");
        }
    }

    const cancelledBooking = await cancelBooking(booking._id, cancellationReason?.trim() || null);
    if (!cancelledBooking) {
        throw new ApiError(409, "Booking could not be cancelled.");
    }

    logger.info(
        {
            name: cancelledBooking.booker.name,
            email: cancelledBooking.booker.email,
            cancelledAt: cancelledBooking.cancelledAt.toISOString(),
        },
        "booking.cancelled"
    );

    return {
        bookingId: cancelledBooking._id,
        status: cancelledBooking.status,
        cancellationReason: cancelledBooking.cancellationReason,
        cancelledAt: cancelledBooking.cancelledAt,
    };
};












export const getBookingByIdService = async ({
    userId,
    orgId,
    bookingId,
}) => {

    validateObjectId(orgId, "Organization ID");
    validateObjectId(bookingId, "Booking ID");

    await checkOrganizationAccess(userId, orgId);

    const booking = await findBookingByIdAndOrg(bookingId, orgId);
    if (!booking) {
        throw new ApiError(404, "Booking not found.");
    }

    logger.info(
        {
            bookingId: booking._id,
            name: booking.booker.name,
            email: booking.booker.email,
        },
        "booking.details_fetched"
    );

    return booking;
};











export const updateBookingService = async ({
    userId,
    orgId,
    bookingId,
    payload,
}) => {

    validateObjectId(bookingId, "booking ID");
    validateObjectId(orgId, "organization ID");

    await checkOrganizationAccess(userId, orgId);

    const updateData = validateBookingUpdate(payload);

    const booking = await updateBooking(
        bookingId,
        orgId,
        updateData
    );
    if (!booking) {
        throw new ApiError(404, "Booking not found.");
    }

    logger.info(
        {
            bookingId: booking._id,
            name: booking.booker.name,
            email: booking.booker.email,
        },
        "booking.updated"
    );

    return booking;
};









export const updateBookingStatusService = async ({
    userId,
    orgId,
    bookingId,
    status,
}) => {

    validateObjectId(bookingId, "booking ID");
    validateObjectId(orgId, "organization ID");

    await checkOrganizationAccess(userId, orgId);

    const booking = await findBookingByIdAndOrganization(bookingId, orgId);
    if (!booking) {
        throw new ApiError(404, "Booking not found.");
    }

    validateBookingStatusTransition(booking.status, status);

    const updateData = {};

    if (status === "COMPLETED") {
        updateData.completedAt = new Date();
    }

    if (status === "CANCELLED") {
        updateData.cancelledAt = new Date();
    }

    const updatedBooking = await updateBookingStatus(bookingId, orgId, status, updateData);
    if (!updatedBooking) {
        throw new ApiError(409, "Booking status could not be updated.");
    }

    logger.info(
        {
            bookingId: updatedBooking._id,
            name: updatedBooking.booker.name,
            email: updatedBooking.booker.email,
            status: updatedBooking.status,
        },
        "booking.status_updated"
    );

    return updatedBooking;
};











export const getOrganizationBookingsService = async ({
    userId,
    orgId,
    query
}) => {
    const { page, limit, search, status, sortBy, sortOrder } = query;

    validateObjectId(orgId, "Organization ID");

    await checkOrganizationAccess(userId, orgId);

    const baseFilter = { organization: orgId, };

    const filter = { ...baseFilter, };

    if (search?.trim()) {
        const safeSearch = search
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            .split(/\s+/)
            .join(".*");

        filter.$or = [
            {
                "booker.name": {
                    $regex: safeSearch,
                    $options: "i",
                },
            },
            {
                "booker.email": {
                    $regex: safeSearch,
                    $options: "i",
                },
            },
            {
                "booker.phone": {
                    $regex: safeSearch,
                    $options: "i",
                },
            },
            {
                "serviceSnapshot.name": {
                    $regex: safeSearch,
                    $options: "i",
                },
            },
        ];
    }

    if (status) {
        if (!BOOKING_STATUSES.includes(status)) {
            throw new ApiError(400, `Invalid booking status. Allowed statuses: ${BOOKING_STATUSES.join(", ")}.`);
        }

        filter.status = status;
    }

    const maxLimit = 100;
    const pagination = getPagination(page, limit, maxLimit);

    logger.info(
        {
            page: pagination.page,
            limit: pagination.limit,
            skip: pagination.skip,
        },
        "booking.pagination"
    );

    const allowedSortFields = [
        "createdAt",
        "updatedAt",
        "startTime",
        "endTime",
        "status",
    ];

    const finalSortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const sort = {
        [finalSortField]: sortOrder === "asc" ? 1 : -1,
    };

    try {
        const [bookings, total, overallTotal] = await Promise.all([
            findBookings({
                filter,
                sort,
                skip: pagination.skip,
                limit: pagination.limit,
            }),

            countBookings(filter),
            countBookings(baseFilter),
        ]);

        logger.info(
            {
                page: pagination.page,
                limit: pagination.limit,
                total: total,
                overallTotal: overallTotal,
            },
            "booking.retrieved"
        );

        return {
            bookings,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                overallTotal,
                totalPages: Math.ceil(total / pagination.limit),
            },
        };

    } catch (error) {
        logger.error(
            {
                error: error.message,
            },
            "booking.retrieval_failed"
        );

        throw new ApiError(500, "Failed to retrieve bookings, please try again.");
    }
};












export const getServiceBookingsService = async ({
    userId,
    serviceId,
    query,
}) => {
    const { page, limit, search, status, sortBy, sortOrder, } = query;

    validateObjectId(serviceId, "Service ID");

    const service = await findServiceById(serviceId);
    if (!service) {
        throw new ApiError(404, "Service not found.");
    }

    await checkOrganizationAccess(userId, service.organization);

    const baseFilter = { service: serviceId };

    const filter = { ...baseFilter };

    if (search?.trim()) {
        const safeSearch = search
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            .split(/\s+/)
            .join(".*");

        filter.$or = [
            {
                "booker.name": {
                    $regex: safeSearch,
                    $options: "i",
                },
            },
            {
                "booker.email": {
                    $regex: safeSearch,
                    $options: "i",
                },
            },
            {
                "booker.phone": {
                    $regex: safeSearch,
                    $options: "i",
                },
            },
        ];
    }

    if (status) {
        if (!BOOKING_STATUSES.includes(status)) {
            throw new ApiError(400, `Invalid booking status. Allowed statuses: ${BOOKING_STATUSES.join(", ")}.`);
        }

        filter.status = status;
    }

    const maxLimit = 100;
    const pagination = getPagination(page, limit, maxLimit);

    logger.info(
        {
            page: pagination.page,
            limit: pagination.limit,
            skip: pagination.skip,
        },
        "booking.pagination"
    );

    const allowedSortFields = [
        "createdAt",
        "updatedAt",
        "startTime",
        "endTime",
        "status",
    ];

    const finalSortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const sort = {
        [finalSortField]: sortOrder === "asc" ? 1 : -1,
    };

    try {
        const [bookings, total, overallTotal,] = await Promise.all([
            findBookings({
                filter,
                sort,
                skip: pagination.skip,
                limit: pagination.limit,
            }),

            countBookings(filter),
            countBookings(baseFilter),
        ]);

        logger.info(
            {
                page: pagination.page,
                limit: pagination.limit,
                total: total,
                overallTotal: overallTotal,
            },
            "booking.retrieved"
        );


        return {
            bookings,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                overallTotal,
                totalPages: Math.ceil(total / pagination.limit),
            },
        };

    } catch (error) {
        logger.error(
            {
                error: error.message,
            },
            "booking.retrieval_failed"
        );

        throw new ApiError(500, "Failed to retrieve service bookings, please try again.");
    }
};