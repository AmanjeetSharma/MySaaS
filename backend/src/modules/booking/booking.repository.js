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

export const findOverlappingOrganizationBooking = async (orgId, startTime, endTime) => {
    return Booking.findOne({
        organization: orgId,
        status: "CONFIRMED",
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
    });
};

export const createBooking = async (bookingData) => {
    return Booking.create(bookingData);
};
