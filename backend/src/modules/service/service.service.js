import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import {
    findOrganizationById,
    createService,
    findServiceById,
    deleteServiceById,
    findServicesByOrganizationId,
    findOrganizationBySlug,
    findServiceBySlug,
} from "./service.repository.js";
import { generateServiceSlug } from "./service.helper.js";






export const createServiceService = async (userId, orgId, payload) => {
    if (!userId) throw new ApiError(400, "Unauthorized access");
    if (!orgId) throw new ApiError(400, "Organization ID is required");
    const { name, description, mode, durationInMinutes, price, currency, address } = payload;

    const requiredFields = { name, mode, durationInMinutes, price, currency };
    for (const [field, value] of Object.entries(requiredFields)) {
        if (!value) {
            throw new ApiError(400, `${field} is required`);
        }
    }

    const organization = await findOrganizationById(orgId);
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    if (userId.toString() !== organization.owner.toString()) {
        throw new ApiError(403, "You do not have permission to create a service for this organization");
    }

    if (mode === "OFFLINE" && !address) {
        throw new ApiError(400, "Address is required to set up offline services");
    }

    const serviceSlug = await generateServiceSlug(name, orgId);

    const newService = await createService({
        organization: orgId,
        createdBy: userId,
        name,
        slug: serviceSlug,
        description,
        mode,
        durationInMinutes,
        price,
        currency,
        address: mode === "OFFLINE" ? address : null,
    });

    console.log(`Service created| Name: ${newService.name} (ID: ${newService._id}) | Slug: ${newService.slug}`);

    return newService;
};









export const updateServiceService = async (userId, serviceId, payload) => {
    if (!userId) throw new ApiError(401, "Unauthorized access");
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) throw new ApiError(400, "Invalid service ID");


    const service = await findServiceById(serviceId);
    if (!service) throw new ApiError(404, "Service not found");

    if (userId.toString() !== service.createdBy.toString()) {
        throw new ApiError(403, "You are not allowed to update this service");
    }

    const { name, description, mode, durationInMinutes, price, currency, address } = payload;

    const oldName = service.name;
    if (name !== undefined) {
        const cleanedName = name.trim();

        if (!cleanedName) {
            throw new ApiError(400, "Service name cannot be empty");
        }

        service.name = cleanedName;

        if (cleanedName !== oldName) {
            service.isSlugStale = true;
        }
    }

    if (description !== undefined) {
        service.description = description?.trim() || "";
    }

    if (mode !== undefined) {
        if (!["ONLINE", "OFFLINE"].includes(mode)) {
            throw new ApiError(400, "Invalid service mode");
        }

        service.mode = mode;
    }

    if (durationInMinutes !== undefined) {
        if (durationInMinutes < 15) {
            throw new ApiError(400, "Duration must be at least 15 minutes");
        }

        service.durationInMinutes = durationInMinutes;
    }

    if (price !== undefined) {
        if (price < 0) {
            throw new ApiError(400, "Price cannot be negative");
        }

        service.price = price;
    }

    if (currency !== undefined) {
        service.currency = currency;
    }

    if (address !== undefined) {
        service.address = address;
    }

    try {
        await service.save();
    } catch (err) {
        throw new ApiError(500, "An error occurred while updating the service, please try again.");
    }

    console.log(`Service updated| Name: ${service.name} (ID: ${service._id}) | Slug: ${service.slug}`);

    return service;
};









export const deleteServiceService = async (userId, serviceId) => {
    if (!userId) throw new ApiError(400, "Unauthorized access");
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) throw new ApiError(400, "Invalid service ID");

    const service = await findServiceById(serviceId);
    if (!service) throw new ApiError(404, "Service not found");

    if (userId.toString() !== service.createdBy.toString()) {
        throw new ApiError(403, "You are not allowed to delete this service");
    }

    try {
        await deleteServiceById(serviceId);
    } catch (err) {
        throw new ApiError(500, "An error occurred while deleting the service, please try again.");
    }

    console.log(`Service deleted| Name: ${service.name} (ID: ${service._id}) | Slug: ${service.slug})`);

    return {
        success: true,
        message: "Service deleted successfully",
    }
};







export const getServiceByIdService = async (serviceId) => {
    if (!mongoose.Types.ObjectId.isValid(serviceId)) throw new ApiError(400, "Invalid service ID");

    const service = await findServiceById(serviceId);
    if (!service) throw new ApiError(404, "Service not found");

    return service;
};







export const getOrganizationServicesService = async (orgId) => {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) throw new ApiError(400, "Invalid organization ID");

    const organization = await findOrganizationById(orgId);
    if (!organization) throw new ApiError(404, "Organization not found");

    const services = await findServicesByOrganizationId(orgId);

    return services;
};






// Public API
export const getServiceBySlugService = async (orgSlug, serviceSlug) => {
    if (!orgSlug || typeof orgSlug !== "string") {
        throw new ApiError(400, "Invalid organization slug");
    }
    if (!serviceSlug || typeof serviceSlug !== "string") {
        throw new ApiError(400, "Invalid service slug");
    }

    const organization = await findOrganizationBySlug(orgSlug);
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    const service = await findServiceBySlug(organization._id, serviceSlug);
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    return service;
};









export const toggleServiceStatusService = async (orgId, serviceId) => {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) { throw new ApiError(400, "Invalid organization ID"); }
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) { throw new ApiError(400, "Invalid service ID"); }

    const organization = await findOrganizationById(orgId);
    if (!organization) { throw new ApiError(404, "Organization not found"); }

    const service = await findServiceById(serviceId);
    if (!service) { throw new ApiError(404, "Service not found"); }

    if (service.organization.toString() !== orgId.toString()) {
        throw new ApiError(403, "This service does not belong to the specified organization");
    }

    if (!service.isActive) {
        if (service.mode === "OFFLINE" &&
            (
                !service.address ||
                !service.address.street ||
                !service.address.city ||
                !service.address.country
            )
        ) { throw new ApiError(400, "Cannot activate offline service without a valid address"); }

        if (service.mode === "ONLINE" && !organization.integrations?.googleCalendar?.isConnected) {
            throw new ApiError(400, "Please complete Google Calendar integration to activate online services");
        }
    }

    service.isActive = !service.isActive;

    try {
        await service.save();
    } catch (err) {
        throw new ApiError(500, "An error occurred while toggling the service status, please try again.");
    }

    console.log(`Service status toggled | Name: ${service.name} (ID: ${service._id}) | New Status: ${service.isActive ? "Active" : "Inactive"}`);

    return {
        success: true,
        isActive: service.isActive,
        message: `Service ${service.isActive ? "activated" : "deactivated"} successfully`,
    };
};










export const toggleAutoGenerateMeetingLinkService = async (userId, serviceId) => {
    if (!userId) throw new ApiError(401, "Unauthorized access");
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) throw new ApiError(400, "Invalid service ID");

    const service = await findServiceById(serviceId);
    if (!service) throw new ApiError(404, "Service not found");

    service.autoGenerateMeetingLink = !service.autoGenerateMeetingLink;

    try {
        await service.save();
    } catch (err) {
        throw new ApiError(500, "An error occurred while toggling the auto-generate meeting link, please try again.");
    }

    return {
        success: true,
        autoGenerateMeetingLink: service.autoGenerateMeetingLink,
        message: `Auto-generate meeting link ${service.autoGenerateMeetingLink ? "enabled" : "disabled"} successfully.`,
    }
};






export const syncServiceSlugService = async (userId, serviceId) => {
    if (!userId) throw new ApiError(401, "Unauthorized access");
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) throw new ApiError(400, "Invalid service ID");

    const service = await findServiceById(serviceId);
    if (!service) throw new ApiError(404, "Service not found");

    if (!service.isSlugStale) {
        throw new ApiError(400, "No syncronization required. Url is already up to date.");
    }

    // ownership check
    if (userId.toString() !== service.createdBy.toString()) {
        throw new ApiError(403, "You are not allowed to change this organization's URL/web address");
    }

    const newSlug = await generateServiceSlug(service.name, service.organization);

    service.slug = newSlug;
    service.isSlugStale = false;

    try {
        await service.save();
    } catch (err) {
        if (err.code === 11000) {
            throw new ApiError(409, "Slug conflict occurred. Please try again.");
        }
        throw new ApiError(500, "An error occurred while syncing the service slug, please try again.");
    }

    console.log(`Service slug synced| Name: ${service.name} (ID: ${service._id}) | New Slug: ${service.slug}`);

    return {
        success: true,
        message: "Service slug synced successfully",
        newSlug: service.slug,
    }
};