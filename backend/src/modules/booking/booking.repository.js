import { Booking } from "./booking.model.js";
import { Organization } from "../organization/organization.model.js";
import { Service } from "../service/service.model.js";
import { Availability } from "../availability/availability.model.js";

export const findOrganizationBySlug = async (slug) => {
    return Organization.findOne({ slug })
        .populate("owner", "name email")
        .select("+integrations.google.refreshToken.encryptedData +integrations.google.refreshToken.iv +integrations.google.refreshToken.authTag");
};


export const findServiceBySlug = async (orgId, slug) => {
    return Service.findOne({ organization: orgId, slug });
};


export const findAvailabilityByServiceId = async (serviceId) => {
    return Availability.findOne({ service: serviceId });
};


export const findOverlappingOrganizationBooking = async (orgId, startTime, endTime, excludeBookingId = null) => {
    const query = {
        organization: orgId,
        status: "CONFIRMED",
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
    }

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    return Booking.findOne(query);
};


export const createBooking = async (bookingData) => {
    return Booking.create(bookingData);
};


export const findBookingByIdAndOrganization = async (bookingId, organizationId) => {
    return Booking.findOne({
        _id: bookingId,
        organization: organizationId,
    })
};


export const cancelBooking = async (bookingId, cancellationReason, cancelledBy) => {
    return Booking.findOneAndUpdate(
        {
            _id: bookingId,
            status: {
                $nin: ["CANCELLED", "COMPLETED"],
            },
        },
        {
            $set: {
                status: "CANCELLED",
                cancellationReason: cancellationReason || null,
                cancelledAt: new Date(),
                cancelledBy,
            },
        },
        {
            returnDocument: "after",
        }
    );
};


export const findOrganizationById = async (orgId) => {
    return Organization.findById(orgId).select("+integrations.google.refreshToken.encryptedData +integrations.google.refreshToken.iv +integrations.google.refreshToken.authTag");
};



export const updateBookingSchedule = async ({
    bookingId,
    startTime,
    endTime,
    timezone,
}) => {
    return Booking.findOneAndUpdate(
        {
            _id: bookingId,
            status: {
                $nin: ["CANCELLED", "COMPLETED"],
            },
        },
        {
            $set: {
                startTime,
                endTime,
                timezone,
            },
        },
        {
            returnDocument: "after",
        }
    );
};


export const findBookingByAccessToken = async (hashedToken) => {
    return Booking.findOne({
        "bookingAccess.hashedToken": hashedToken,
    })
        .populate("organization", "name slug")
        .populate("service", "name slug");
};


export const findBookingByIdAndOrg = async (bookingId, orgId) => {
    return Booking.findOne({
        _id: bookingId,
        organization: orgId,
    })
        .populate("organization", "name slug")
        .populate("service", "name slug");
};


export const updateBooking = async (bookingId, orgId, updateData) => {
    return Booking.findOneAndUpdate(
        {
            _id: bookingId,
            organization: orgId,
        },
        {
            $set: updateData,
        },
        {
            new: true,
            runValidators: true,
        }
    );
};


export const updateBookingStatus = async (bookingId, orgId, status, updateData = {}) => {
    return Booking.findOneAndUpdate(
        {
            _id: bookingId,
            organization: orgId,
        },
        {
            $set: {
                status,
                ...updateData,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );
};


export const findOrganizationBookings = async ({
    filter,
    sort,
    skip,
    limit,
}) => {
    return Booking.find(filter, {
        _id: 1,
        booker: 1,
        service: 1,
        startTime: 1,
        endTime: 1,
        timezone: 1,
        status: 1,
        "serviceSnapshot.price": 1,
        "serviceSnapshot.currency": 1,
        createdAt: 1,
    })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("service", "name")
        .lean();
};


export const countOrganizationBookings = async (filter) => {
    return Booking.countDocuments(filter);
};