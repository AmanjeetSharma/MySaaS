import crypto from "crypto";
import { ApiError } from "../../utils/ApiError.js";
import env from "../../config/env.config.js";
import { sendEmail } from "../../integrations/email.integration.js";
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
} from "./booking.repository.js";
import {
    validateObjectId,
    validateBookerDetails,
    validateStartTime,
    validateTimezone,
    generateBookingAccessToken,
    normalizeSlug,
    validateRequestedSlot,
    buildServiceSnapshot,
    shouldCreateGoogleEvent,
    buildManageBookingUrl,
    sendBookingEmails,
    validateCancellation,
    validateRescheduling,
    hashBookingAccessToken,
} from "./booking.helper.js";
import { decryptRefreshToken } from "../providers/google/google.utils.js";
import {
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
} from "../providers/google/services/calendar.service.js";
import { checkOrganizationAccess } from "../organization/organization.access.js";






const tryCreateGoogleEvent = async ({
    organization,
    service,
    booker,
    startTime,
    endTime,
    timezone,
    manageBookingUrl,
}) => {
    if (!shouldCreateGoogleEvent(service, organization)) {
        return {
            meeting: {
                provider: service.mode === "ONLINE" ? service.meetingProvider : null,
                link: null,
            },
            calendarEvent: {},
        };
    }

    try {
        const refreshToken = decryptRefreshToken(organization.integrations.google.refreshToken);
        const calendarId = organization.integrations.google.calendarId;
        const event = await createCalendarEvent({
            refreshToken,
            calendarId,
            summary: `${service.name} with ${booker.name}`,
            description: [
                `Booking for ${service.name}`,
                `Booker: ${booker.name} <${booker.email}>`,
                manageBookingUrl ? `Manage booking url for ${booker.name}: ${manageBookingUrl}` : null,
            ].filter(Boolean).join("\n"),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            timeZone: timezone,
            attendees: [{ email: booker.email, displayName: booker.name }],
            generateMeetLink: true,
        });

        return {
            meeting: {
                provider: service.meetingProvider,
                link: event.meetLink,
            },
            calendarEvent: {
                provider: "GOOGLE",
                calendarId,
                eventId: event.eventId,
                htmlLink: event.htmlLink,
            },
        };
    } catch (error) {
        console.error("[Booking] Google Calendar event creation failed:", error.message);

        return {
            meeting: {
                provider: service.meetingProvider,
                link: null,
            },
            calendarEvent: {},
        };
    }
};







export const createBookingService = async (payload = {}) => {
    const organizationSlug = normalizeSlug(payload.organizationSlug, "Organization slug");
    const serviceSlug = normalizeSlug(payload.serviceSlug, "Service slug");

    validateBookerDetails(payload.booker);

    const startTime = validateStartTime(payload.startTime);

    validateTimezone(payload.timezone);

    const organization = await findOrganizationBySlug(organizationSlug);
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    const service = await findServiceBySlug(organization._id, serviceSlug);
    if (!service || !service.isActive) {
        throw new ApiError(404, "Service not found");
    }

    const availability = await findAvailabilityByServiceId(service._id);
    if (!availability) {
        throw new ApiError(400, "Bookings are currently unavailable");
    }

    const endTime = validateRequestedSlot({
        startTime,
        availability,
        durationInMinutes: service.durationInMinutes,
    });

    const conflictingBooking = await findOverlappingOrganizationBooking(
        organization._id,
        startTime,
        endTime
    );

    if (conflictingBooking) {
        throw new ApiError(409, "The selected time slot is already booked. Please choose a different time.");
    }

    const booker = {
        name: payload.booker.name.trim(),
        email: payload.booker.email.trim().toLowerCase(),
        phone: payload.booker.phone?.trim() || null,
    };

    const accessToken = generateBookingAccessToken();

    const manageBookingUrl = buildManageBookingUrl(accessToken.rawToken);

    const googleResult = await tryCreateGoogleEvent({
        organization,
        service,
        booker,
        startTime,
        endTime,
        timezone: payload.timezone,
        manageBookingUrl,
    });

    const booking = await createBooking({
        organization: organization._id,
        service: service._id,
        booker,
        serviceSnapshot: buildServiceSnapshot(service),
        startTime,
        endTime,
        timezone: payload.timezone,
        meeting: googleResult.meeting,
        calendarEvent: googleResult.calendarEvent,
        notes: payload.notes?.trim() || null,
        bookingAccess: {
            hashedToken: accessToken.hashedToken,
            expiresAt: accessToken.expiresAt,
        },
    });

    await sendBookingEmails({ booking, organization, manageBookingUrl });

    console.log(`[Booking] Booking created for ${booker.name} (${booker.email}) at ${startTime.toISOString()} for service "${service.name}" in organization "${organization.name}".\nToken: ${accessToken.rawToken}\nManage Booking URL: ${manageBookingUrl}`);

    return {
        bookingId: booking._id,
        meetingLink: booking.meeting?.link ?? null,
        manageBookingUrl,
    };
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

    return updatedBooking;
};










export const getPublicBookingService = async ({ rawToken }) => {
    const hashedToken = hashBookingAccessToken(rawToken);

    const booking = await findBookingByAccessToken(hashedToken);
    if (!booking) {
        throw new ApiError(404, "Invalid or expired booking link.");
    }

    if (
        !booking.bookingAccess?.expiresAt ||
        booking.bookingAccess.expiresAt <= new Date()
    ) {
        throw new ApiError(410, "This booking management link has expired.");
    }

    const isManageable = !["CANCELLED", "COMPLETED"].includes(booking.status);

    return {
        bookingId: booking._id,

        organization: {
            name: booking.organization?.name,
            slug: booking.organization?.slug,
        },

        service: {
            name: booking.serviceSnapshot?.name,
            slug: booking.serviceSnapshot?.slug,
        },

        booker: {
            name: booking.booker.name,
            email: booking.booker.email,
            phone: booking.booker.phone,
        },

        startTime: booking.startTime,
        endTime: booking.endTime,
        timezone: booking.timezone,

        meeting: {
            provider: booking.meeting?.provider ?? null,
            link: booking.meeting?.link ?? null,
        },

        status: booking.status,

        cancellationReason: booking.cancellationReason ?? null,

        cancelledAt: booking.cancelledAt ?? null,

        notes: booking.notes ?? null,

        canReschedule: isManageable,

        canCancel: isManageable,

        accessTokenExpiresAt: booking.bookingAccess.expiresAt,
    };
};