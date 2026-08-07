import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import {
    findAvailabilityByServiceId,
    createAvailability,
    findServiceById,
    findOrganizationById,
    deleteAvailabilityByServiceId,
} from "./availability.repository.js";
import { timezoneValidator } from "../user/settings/settings.validator.js";
import { DAYS_OF_WEEK } from "./availability.constant.js";






export const createAvailabilityService = async ({
    userId,
    serviceId,
    payload,
}) => {
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(400, "Service ID is required and must be a valid ObjectId");
    }

    if (!payload.days) {
        throw new ApiError(400, "Days availability is required");
    }

    const existingAvailability = await findAvailabilityByServiceId(serviceId);
    if (existingAvailability) {
        throw new ApiError(409, "Availability already exists for this service");
    }

    const service = await findServiceById(serviceId, "organization name");
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    const organization = await findOrganizationById(service.organization, "owner members");
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    const hasAccess =
        userId.toString() === organization.owner.toString() ||
        organization.members.some(
            (member) =>
                member.user.toString() === userId.toString()
        );

    if (!hasAccess) {
        throw new ApiError(403, "Access denied. You cannot perform this action on this organization");
    }

    const timezoneValidation = timezoneValidator(payload.timezone);
    if (!timezoneValidation.valid) {
        throw new ApiError(400, timezoneValidation.errors.join(", "));
    }

    const availability = await createAvailability({
        service: serviceId,
        timezone: payload.timezone,
        days: payload.days,
    });

    return availability;
};










export const updateAvailabilityService = async (userId, serviceId, payload) => {
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(400, "Invalid service ID");
    }

    const availability = await findAvailabilityByServiceId(serviceId);
    if (!availability) {
        throw new ApiError(404, "Availability not found");
    }

    const service = await findServiceById(serviceId, "organization name");
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    const organization = await findOrganizationById(service.organization, "owner members");
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    if (
        userId.toString() !== organization.owner.toString() &&
        !organization.members.some(
            (member) => member.user.toString() === userId.toString()
        )
    ) {
        throw new ApiError(403, "Access denied. You can not perform this action on an organization you do not belong to");
    }

    const timezoneValidation = timezoneValidator(payload.timezone);
    if (!timezoneValidation.valid) {
        throw new ApiError(400, timezoneValidation.errors.join(", "));
    }

    if (payload.timezone !== undefined) {
        availability.timezone = payload.timezone;
    }

    for (const day of DAYS_OF_WEEK) {
        if (payload[day] !== undefined) {
            availability[day] = payload[day];
        }
    }

    try {
        await availability.save();
    } catch (err) {
        throw new ApiError(500, "An error occurred while updating availability, please try again.");
    }

    console.log(`Availability updated with ID: ${availability._id} for service: ${service.name}(ID: ${service._id})`);

    return availability;
};











export const getAvailabilityByServiceIdService = async (userId, serviceId) => {
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(400, "Invalid service ID");
    }

    const availability = await findAvailabilityByServiceId(serviceId);
    if (!availability) {
        throw new ApiError(404, "Availability not found");
    }

    const service = await findServiceById(serviceId, "organization name");
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    const organization = await findOrganizationById(service.organization, "owner members");
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    if (
        userId.toString() !== organization.owner.toString() &&
        !organization.members.some(
            (member) => member.user.toString() === userId.toString()
        )
    ) {
        throw new ApiError(403, "Access denied. You are not authorized to view availability for this service");
    }

    console.log(`Availability fetched with ID: ${availability._id} for service: ${service.name}(ID: ${service._id})`);

    return availability;
};











export const deleteAvailabilityService = async (userId, serviceId) => {
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(400, "Invalid service ID");
    }

    const service = await findServiceById(serviceId, "organization name");
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    const organization = await findOrganizationById(service.organization, "owner members");
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    if (
        userId.toString() !== organization.owner.toString() &&
        !organization.members.some(
            (member) => member.user.toString() === userId.toString()
        )
    ) {
        throw new ApiError(403, "Access denied. You cannot perform this action on an organization you do not belong to");
    }

    const availability = await findAvailabilityByServiceId(serviceId);
    if (!availability) {
        throw new ApiError(404, "Availability not found");
    }

    await deleteAvailabilityByServiceId(serviceId);

    console.log(`Availability deleted with ID: ${serviceId} for service: ${service.name}(ID: ${service._id})`);

    return {
        success: true,
        message: "Availability deleted successfully",
    };
};