import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import {
    findAvailabilityByServiceId,
    createAvailability,
    findServiceById,
    deleteAvailabilityByServiceId,
} from "./availability.repository.js";
import { timezoneValidator } from "../user/settings/settings.validator.js";
import { DAYS_OF_WEEK } from "./availability.constant.js";
import { checkOrganizationAccess } from "../organization/organization.access.js";






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

    const service = await findServiceById(serviceId, "organization name");
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    await checkOrganizationAccess(userId, service.organization);

    const existingAvailability = await findAvailabilityByServiceId(serviceId);
    if (existingAvailability) {
        throw new ApiError(409, "Availability already exists for this service");
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

    console.log(`Availability created with ID: ${availability._id} for service: ${service.name} (ID: ${service._id})`);

    return availability;
};









export const updateAvailabilityService = async ({
    userId,
    serviceId,
    payload,
}) => {
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(400, "Service ID is required and must be a valid ObjectId");
    }

    const service = await findServiceById(serviceId, "organization name");
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    await checkOrganizationAccess(userId, service.organization);

    const availability = await findAvailabilityByServiceId(serviceId);
    if (!availability) {
        throw new ApiError(404, "Availability not found");
    }


    if (payload.timezone !== undefined) {
        const timezoneValidation = timezoneValidator(payload.timezone);
        if (!timezoneValidation.valid) {
            throw new ApiError(400, timezoneValidation.errors.join(", "));
        }

        availability.timezone = payload.timezone;
    }


    if (payload.days !== undefined) {
        availability.days = payload.days;
    }

    await availability.save();

    console.log(`Availability updated with ID: ${availability._id} for service: ${service.name} (ID: ${service._id})`);

    return availability;
};











export const getAvailabilityByServiceIdService = async ({
    userId,
    serviceId
}) => {
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(400, "Service ID is required and must be a valid ObjectId");
    }

    const service = await findServiceById(serviceId, "organization name");
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    await checkOrganizationAccess(userId, service.organization);

    const availability = await findAvailabilityByServiceId(serviceId);
    if (!availability) {
        throw new ApiError(404, "Availability not found");
    }

    console.log(`Availability fetched with ID: ${availability._id} for service: ${service.name}(ID: ${service._id})`);

    return availability;
};











export const deleteAvailabilityService = async ({
    userId,
    serviceId
}) => {
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(400, "Service ID is required and must be a valid ObjectId");
    }

    const service = await findServiceById(serviceId, "organization name");
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    await checkOrganizationAccess(userId, service.organization);

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