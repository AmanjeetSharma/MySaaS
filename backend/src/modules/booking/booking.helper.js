import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { findOverlappingBooking } from "./booking.repository.js";
import { BOOKING_STATUSES } from "./booking.constants.js";
import { emailValidator, nameValidator } from "../../validations/auth.validators.js";
import { timezoneValidator } from "../user/settings/settings.validator.js";

export const validateObjectId = (id, label) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, `Invalid ${label}`);
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

export const validateTimezone = (timezone) => {
    const timezoneValidation = timezoneValidator(timezone);
    if (!timezoneValidation.valid) {
        throw new ApiError(400, timezoneValidation.errors.join(", "));
    }
};

export const validateBookingStatus = (status) => {
    if (!BOOKING_STATUSES.includes(status)) {
        throw new ApiError(400, "Invalid booking status");
    }
};

export const validateStatusTransition = (currentStatus, newStatus) => {
    const validTransitions = {
        PENDING: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["COMPLETED", "CANCELLED", "NO_SHOW"],
        COMPLETED: [],
        CANCELLED: [],
        NO_SHOW: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
        throw new ApiError(400, `Cannot transition from ${currentStatus} to ${newStatus}`);
    }
};

export const checkOverlappingBooking = async (serviceId, startTime, endTime, excludeBookingId) => {
    const overlappingBooking = await findOverlappingBooking(
        serviceId,
        startTime,
        endTime,
        excludeBookingId
    );

    if (overlappingBooking) {
        throw new ApiError(409, "This time slot is already booked");
    }
};

export const buildBookingQuery = (query = {}) => {
    const filter = {};

    if (query.status) {
        if (!BOOKING_STATUSES.includes(query.status)) {
            throw new ApiError(400, "Invalid booking status");
        }
        filter.status = query.status;
    }

    if (query.from || query.to) {
        filter.startTime = {};
        if (query.from) {
            const from = new Date(query.from);
            if (Number.isNaN(from.getTime())) {
                throw new ApiError(400, "Invalid from date");
            }
            filter.startTime.$gte = from;
        }
        if (query.to) {
            const to = new Date(query.to);
            if (Number.isNaN(to.getTime())) {
                throw new ApiError(400, "Invalid to date");
            }
            filter.startTime.$lte = to;
        }
    }

    return filter;
};

export const getPaginationOptions = (query = {}) => {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};
