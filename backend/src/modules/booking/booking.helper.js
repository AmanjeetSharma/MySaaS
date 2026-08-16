import crypto from "crypto";
import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { emailValidator, nameValidator } from "../../validations/auth.validators.js";
import { bookingConfirmationBookerEmailTemplate } from "../../utils/email/bookingConfirmationBookerEmailTemplate.js";
import { bookingConfirmationOwnerEmailTemplate } from "../../utils/email/bookingConfirmationOwnerEmailTemplate.js";
import env from "../../config/env.config.js";
import { sendEmail } from "../../integrations/email.integration.js";
import { BOOKING_STATUSES, BOOKING_STATUS_TRANSITIONS } from "./booking.constants.js";

export const BOOKING_ACCESS_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;// 30 days in ms






export const validateObjectId = (id, label) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, `${label} is required and must be a valid ObjectId.`);
    }
};





export const validateBookerDetails = (booker) => {
    if (!booker) {
        throw new ApiError(400, "Booker details are required");
    }

    const { name, email } = booker;

    if (!name || !email) {
        throw new ApiError(400, "Booker name and email are required");
    }

    const nameValidation = nameValidator(name);
    if (!nameValidation.valid) {
        throw new ApiError(400, nameValidation.errors.join(", "));
    }

    if (!emailValidator(email)) {
        throw new ApiError(400, "Invalid email address");
    }

    return true;
};





export const validateStartTime = (startTime) => {
    if (!startTime) {
        throw new ApiError(400, "Start time is required");
    }

    const parsedStartTime = new Date(startTime);
    if (Number.isNaN(parsedStartTime.getTime())) {
        throw new ApiError(400, "Invalid start time");
    }
    if (parsedStartTime <= new Date()) {
        throw new ApiError(400, "Booking start time must be in the future");
    }

    return parsedStartTime;
};





export const generateBookingAccessToken = () => {
    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const expiresAt = new Date(Date.now() + BOOKING_ACCESS_TOKEN_TTL_MS);

    return {
        rawToken,
        hashedToken,
        expiresAt,
    };
};





export const normalizeSlug = (value, label) => {
    if (!value || typeof value !== "string" || !value.trim()) {
        throw new ApiError(400, `${label} is required`);
    }

    return value.trim().toLowerCase();
};





export const getZonedDateParts = (date, timezone) => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(date);

    const getPart = (type) => parts.find((part) => part.type === type)?.value;

    return {
        dayName: getPart("weekday").toLowerCase(),
        minuteOfDay:
            Number(getPart("hour")) * 60 +
            Number(getPart("minute")),
    };
};





export const validateRequestedSlot = ({
    startTime,
    availability,
    durationInMinutes
}) => {
    const scheduleTimezone = availability.timezone;

    const { dayName, minuteOfDay } = getZonedDateParts(startTime, scheduleTimezone);

    const daySchedule = availability.days?.[dayName];

    if (!daySchedule?.enabled || !daySchedule.slots?.length) {
        throw new ApiError(400, "Requested day is currently not available for bookings");
    }

    const matchingSlot = daySchedule.slots.find((slot) => (
        minuteOfDay >= slot.startTime &&
        minuteOfDay + durationInMinutes <= slot.endTime
    ));

    if (!matchingSlot) {
        throw new ApiError(400, "Requested time slot is not available");
    }

    return new Date(startTime.getTime() + durationInMinutes * 60 * 1000);
};





export const validateNotSameBookingTime = ({
    booking,
    newStartTime,
    newEndTime,
}) => {
    if (
        booking.startTime.getTime() === newStartTime.getTime() &&
        booking.endTime.getTime() === newEndTime.getTime()
    ) {
        throw new ApiError(400, "The booking is already scheduled for this time.");
    }
};





export const buildServiceSnapshot = (service) => ({
    name: service.name,
    slug: service.slug,
    durationInMinutes: service.durationInMinutes,
    price: service.price,
    currency: service.currency,
    mode: service.mode,

    meetingProvider:
        service.mode === "ONLINE"
            ? service.meetingProvider
            : null,

    autoGenerateMeetingLink:
        service.mode === "ONLINE"
            ? service.autoGenerateMeetingLink
            : false,

    address:
        service.mode === "OFFLINE"
            ? service.address
            : null,
});





export const shouldCreateGoogleCalendarEvent = (organization) => {
    const google =
        organization.integrations?.google;

    return (
        google?.isConnected === true &&
        google?.refreshToken?.encryptedData &&
        google?.calendarId
    );
};





export const shouldGenerateGoogleMeet = (service) => {
    return (
        service.mode === "ONLINE" &&
        service.meetingProvider === "GOOGLE_MEET" &&
        service.autoGenerateMeetingLink === true
    );
};





export const buildServiceLocation = (service) => {
    if (service.mode !== "OFFLINE") {
        return null;
    }

    if (!service.address) {
        return null;
    }

    return [
        service.address.street,
        service.address.city,
        service.address.state,
        service.address.country,
        service.address.zipCode,
    ]
        .filter(Boolean) //to clean all falsy values
        .join(", ");
};





export const buildManageBookingUrl = (rawToken) => {
    return `${env.CLIENT_URL}/book/manage?token=${encodeURIComponent(rawToken)}`;
}





export const sendBookingEmails = async ({
    booking,
    organization,
    manageBookingUrl,
}) => {
    if (!env.EMAIL_ENABLED) return;

    const date = new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: booking.timezone,
    }).format(booking.startTime);

    const templateData = {
        organizationName: organization.name,
        serviceName: booking.serviceSnapshot.name,
        date,
        durationInMinutes: booking.serviceSnapshot.durationInMinutes,
        mode: booking.serviceSnapshot.mode,
        address: booking.serviceSnapshot.address,
        meetingLink: booking.meeting?.link ?? null,
    };

    const bookerEmailHTML = bookingConfirmationBookerEmailTemplate({
        ...templateData,
        bookerName: booking.booker.name,
        manageBookingUrl,
    });

    try {
        await sendEmail(booking.booker.email, "Booking confirmed - MySaaS", bookerEmailHTML, true);
    } catch (error) {
        console.error(`[Booking Email] Failed to send confirmation email to ${booking.booker.email}:`, error.message);
    }


    // Owner email is disabled and will be implemented using bullmq

    // const ownerEmail = organization.owner?.email;

    // const ownerEmailHTML = ownerEmail ? bookingConfirmationOwnerEmailTemplate({
    //     ...templateData,

    //     ownerName: organization.owner?.name,
    //     bookerName: booking.booker.name,
    //     bookerEmail: booking.booker.email,
    //     bookerPhone: booking.booker.phone,
    // }) : null;

    // try {
    //     if (ownerEmail && ownerEmailHTML) {
    //         await sendEmail(ownerEmail, "New booking received - MySaaS", ownerEmailHTML, true);
    //     }
    // } catch (error) {
    //     console.error(`[Booking Email] Failed to send notification email to ${ownerEmail}:`, error.message);
    // }
};





export const validateCancellation = (booking) => {
    if (!booking) {
        throw new ApiError(404, "Booking not found.");
    }
    if (booking.status === "CANCELLED") {
        throw new ApiError(400, "Booking is already cancelled.");
    }

    if (booking.status === "COMPLETED") {
        throw new ApiError(400, "Completed bookings cannot be cancelled.");
    }

    return true;
};





export const validateRescheduling = (booking) => {
    if (!booking) {
        throw new ApiError(404, "Booking not found.");
    }

    if (booking.status === "CANCELLED") {
        throw new ApiError(400, "Cancelled bookings cannot be rescheduled.");
    }

    if (booking.status === "COMPLETED") {
        throw new ApiError(400, "Completed bookings cannot be rescheduled.");
    }

    return true;
};





export const hashBookingAccessToken = (rawToken) => {
    if (!rawToken || typeof rawToken !== "string" || !rawToken.trim()) {
        throw new ApiError(400, "Booking access token is required.");
    }

    return crypto.createHash("sha256").update(rawToken).digest("hex");
};





export const validateBookingAccess = (booking) => {
    if (!booking) {
        throw new ApiError(404, "Invalid or expired booking link.");
    }

    if (
        !booking.bookingAccess?.expiresAt ||
        booking.bookingAccess.expiresAt <= new Date()
    ) {
        throw new ApiError(410, "This booking management link has expired.");
    }

    return true;
};





export const validateBookingUpdate = (payload = {}) => {
    const allowedFields = ["booker", "notes",];
    const updateData = {};

    for (const field of allowedFields) {
        if (payload[field] !== undefined) {
            updateData[field] = payload[field];
        }
    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No valid booking fields were provided for update.");
    }

    if (updateData.booker !== undefined) {
        if (
            !updateData.booker ||
            typeof updateData.booker !== "object"
        ) {
            throw new ApiError(400, "Invalid booker details.");
        }

        const { name, email, phone } = updateData.booker;

        if (name !== undefined) {
            const nameValidation = nameValidator(name);

            if (!nameValidation.valid) {
                throw new ApiError(400, nameValidation.errors.join(", "));
            }

            updateData.booker.name = name.trim();
        }

        if (email !== undefined) {
            if (!emailValidator(email)) {
                throw new ApiError(400, "Invalid email address.");
            }

            updateData.booker.email = email.trim().toLowerCase();
        }

        if (phone !== undefined) {
            updateData.booker.phone = phone?.trim() || null;
        }
    }

    if (updateData.notes !== undefined) {
        if (
            updateData.notes !== null &&
            typeof updateData.notes !== "string"
        ) {
            throw new ApiError(400, "Notes must be a string.");
        }

        if (updateData.notes) {
            updateData.notes = updateData.notes.trim();
        }
    }

    return updateData;
};





export const validateBookingStatus = (status) => {
    if (!status || !BOOKING_STATUSES.includes(status)) {
        throw new ApiError(400, `Invalid booking status. Allowed statuses: ${BOOKING_STATUSES.join(", ")}.`);
    }

    return true;
};

export const validateBookingStatusTransition = (currentStatus, newStatus) => {
    
    validateBookingStatus(newStatus);

    if (currentStatus === newStatus) {
        throw new ApiError(400, `Booking is already ${newStatus}.`);
    }

    const allowedTransitions = BOOKING_STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
        throw new ApiError(400, `Booking cannot be changed from ${currentStatus} to ${newStatus}.`);
    }

    return true;
};