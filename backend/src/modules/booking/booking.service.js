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

        console.error("[Booking] Google Calendar event creation failed:", error?.response?.data || error);

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
        console.log(`[Booking] Pending booking exists: ${existingPendingBooking._id} | ${booker.email} | expires ${existingPendingBooking.paymentExpiresAt.toISOString()}`);

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
        console.error("[Booking] Failed to create pending booking:", error.message);
        throw new ApiError(500, "Unable to create booking. Please try again.");
    }

    console.log(`[Booking: public api] New pending booking created: ${booking._id} | ${booking.booker.email} | expires ${paymentExpiresAt.toISOString()}`);

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

    // Staff authorization
    await checkOrganizationAccess(userId, orgId);

    const booking = await findBookingByIdAndOrganization(bookingId, orgId);

    validateCancellation(booking);

    // delete Google Calendar event if it exists otherwise exit with api error
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
                console.error("[Booking] Failed to delete Google Calendar event:", error.message);
                throw new ApiError(500, "We encountered an error while cancelling the booking. Please try again later.");
            }
        }
    }

    const cancelledBooking = await cancelBooking(bookingId, cancellationReason?.trim() || null, userId);
    if (!cancelledBooking) {
        throw new ApiError(409, "Booking could not be cancelled.");
    }

    console.log(`[Booking] Booking cancelled for ${cancelledBooking.booker.name} (${cancelledBooking.booker.email}) at ${cancelledBooking.cancelledAt.toISOString()}.`);

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
            console.error("[Booking] Google Calendar event update failed:", error.message);
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

    console.log(`[Booking] Booking rescheduled for ${updatedBooking.booker.name} (${updatedBooking.booker.email}) to ${updatedBooking.startTime.toISOString()}.`);

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

    console.log(`[Booking: public api] Booking details fetched for ${booking.booker.name} (${booking.booker.email}) by manageBookingURL.`);

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
            console.error("[Public Booking] Google Calendar event update failed:", error.message);
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

    console.log(`[Booking: public api] Booking rescheduled for ${updatedBooking.booker.name} (${updatedBooking.booker.email}) to ${updatedBooking.startTime.toISOString()}.`);

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
            console.error("[Public Booking] Google Calendar event deletion failed:", error.message);
            throw new ApiError(500, "We encountered an error while cancelling the booking. Please try again later..");
        }
    }

    const cancelledBooking = await cancelBooking(booking._id, cancellationReason?.trim() || null);
    if (!cancelledBooking) {
        throw new ApiError(409, "Booking could not be cancelled.");
    }

    console.log(`[Booking: public api] Booking cancelled for ${cancelledBooking.booker.name} (${cancelledBooking.booker.email}) at ${cancelledBooking.cancelledAt.toISOString()}.`);

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

    console.log(`[Booking] Booking details fetched for ${booking.booker.name} (${booking.booker.email}).`);

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

    console.log(`[Booking] Booking updated for ${booking.booker.name} (${booking.booker.email}).`);

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

    console.log(`[Booking] Booking status updated for ${updatedBooking.booker.name} (${updatedBooking.booker.email}) to "${updatedBooking.status}".`);

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

    console.log(`--------\npage: ${pagination.page} | limit: ${pagination.limit} | skip: ${pagination.skip}`); // debug log 

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

        console.log(`[Booking] Retrieved ${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"} for organization ${orgId}. Total: ${total}, Overall Total: ${overallTotal}.`);

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
        console.error("Failed to fetch organization bookings:", error);
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

    console.log(`--------\n page: ${pagination.page} | limit: ${pagination.limit} | skip: ${pagination.skip}`); // debug log

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

        console.log(`[Booking] Retrieved ${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"} for service ${serviceId}. Total: ${total}, Overall Total: ${overallTotal}.`);


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
        console.error("Failed to fetch service bookings:", error);
        throw new ApiError(500, "Failed to retrieve service bookings, please try again.");
    }
};