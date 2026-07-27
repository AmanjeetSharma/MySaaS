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
import env from "../../config/env.config.js";
import {
    serviceNameValidator,
    serviceDescriptionValidator,
    serviceModeValidator,
    serviceDurationValidator,
    servicePriceValidator,
    serviceCurrencyValidator,
    serviceAddressValidator,
    serviceOnlineMeetingProviderValidator,
} from "./service.validator.js";










export const createServiceService = async (userId, orgId, payload) => {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Organization ID is required, and must be a valid ObjectId");
    }
    const {
        name,
        description,
        mode,
        onlineMeetingProvider,
        durationInMinutes,
        price,
        currency,
        address,
        autoGenerateMeetingLink,
    } = payload;

    const requiredFields = {
        name,
        mode,
        durationInMinutes,
        price,
        currency,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
        if (value === undefined ||
            value === null ||
            (typeof value === "string" && !value.trim())
        ) {
            throw new ApiError(400, `${field} is required`);
        }
    }

    const nameValidation = serviceNameValidator(name);
    if (!nameValidation.valid) {
        throw new ApiError(400, nameValidation.errors.join(", "));
    }

    const descriptionValidation = serviceDescriptionValidator(description);
    if (!descriptionValidation.valid) {
        throw new ApiError(400, descriptionValidation.errors.join(", "));
    }

    const modeValidation = serviceModeValidator(mode);
    if (!modeValidation.valid) {
        throw new ApiError(400, modeValidation.errors.join(", "));
    }

    const durationValidation = serviceDurationValidator(durationInMinutes);
    if (!durationValidation.valid) {
        throw new ApiError(400, durationValidation.errors.join(", "));
    }

    const priceValidation = servicePriceValidator(price);
    if (!priceValidation.valid) {
        throw new ApiError(400, priceValidation.errors.join(", "));
    }

    const currencyValidation = serviceCurrencyValidator(currency);
    if (!currencyValidation.valid) {
        throw new ApiError(400, currencyValidation.errors.join(", "));
    }

    if (mode === "ONLINE") {
        if (!onlineMeetingProvider || (typeof onlineMeetingProvider !== "string" && !onlineMeetingProvider.trim())) {
            throw new ApiError(400, "Online meeting provider is required for online services");
        }

        const onlineMeetingProviderValidation = serviceOnlineMeetingProviderValidator(onlineMeetingProvider);
        if (!onlineMeetingProviderValidation.valid) {
            throw new ApiError(400, onlineMeetingProviderValidation.errors.join(", "));
        }

        if (autoGenerateMeetingLink !== undefined && typeof autoGenerateMeetingLink !== "boolean") {
            throw new ApiError(400, "Auto-generate meeting link must be a boolean value");
        }
    }

    if (mode === "OFFLINE") {
        if (!address) {
            throw new ApiError(400, "Address is required to set up offline services");
        }

        const addressValidation = serviceAddressValidator(address);
        if (!addressValidation.valid) {
            throw new ApiError(400, addressValidation.errors.join(", "));
        }
    }

    const organization = await findOrganizationById(orgId);
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
        onlineMeetingProvider: mode === "ONLINE" ? onlineMeetingProvider : null,
        address: mode === "OFFLINE" ? address : null,
        autoGenerateMeetingLink: mode === "ONLINE" ? (autoGenerateMeetingLink ?? true) : false,
    });

    console.log(`Service created| Name: ${newService.name} (ID: ${newService._id}) | Slug: ${newService.slug}`);

    return newService;
};












export const updateServiceService = async (userId, serviceId, payload) => {
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(400, "Invalid service ID");
    }

    const { name, description, mode, durationInMinutes, price, currency, address } = payload;

    if (name !== undefined) {
        const nameValidation = serviceNameValidator(name);
        if (!nameValidation.valid) {
            throw new ApiError(400, nameValidation.errors.join(", "));
        }
    }

    if (description !== undefined) {
        const descriptionValidation = serviceDescriptionValidator(description);
        if (!descriptionValidation.valid) {
            throw new ApiError(400, descriptionValidation.errors.join(", "));
        }
    }

    if (mode !== undefined) {
        if (mode === "OFFLINE" && !address) {
            throw new ApiError(400, "Address is required to set up offline services");
        }
        const modeValidation = serviceModeValidator(mode);
        if (!modeValidation.valid) {
            throw new ApiError(400, modeValidation.errors.join(", "));
        }
    }

    if (durationInMinutes !== undefined) {
        const durationValidation = serviceDurationValidator(durationInMinutes);
        if (!durationValidation.valid) {
            throw new ApiError(400, durationValidation.errors.join(", "));
        }
    }

    if (price !== undefined) {
        const priceValidation = servicePriceValidator(price);
        if (!priceValidation.valid) {
            throw new ApiError(400, priceValidation.errors.join(", "));
        }
    }

    if (currency !== undefined) {
        const currencyValidation = serviceCurrencyValidator(currency);
        if (!currencyValidation.valid) {
            throw new ApiError(400, currencyValidation.errors.join(", "));
        }
    }

    if (address !== undefined && address !== null) {
        const addressValidation = serviceAddressValidator(address);
        if (!addressValidation.valid) {
            throw new ApiError(400, addressValidation.errors.join(", "));
        }
    }

    const service = await findServiceById(serviceId);
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    const organization = await findOrganizationById(service.organization);
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    //check  if owner or member can update service details
    if (
        userId.toString() !== organization.owner.toString() &&
        !organization.members.some(
            (member) => member.user.toString() === userId.toString()
        )
    ) {
        throw new ApiError(403, "Access denied. You can not perform this action on an organization you do not belong to");
    }

    const oldName = service.name;
    if (name && name !== service.name) {
        service.name = name;
        service.isSlugStale = true;
    }

    if (description !== undefined) service.description = description;
    if (mode !== undefined) service.mode = mode;
    if (durationInMinutes !== undefined) service.durationInMinutes = durationInMinutes;
    if (price !== undefined) service.price = price;
    if (currency !== undefined) service.currency = currency;
    if (address !== undefined) service.address = address;

    const finalMode = mode || service.mode;
    if (
        finalMode === "OFFLINE" &&
        !(address !== undefined ? address : service.address)
    ) {
        throw new ApiError(400, "Address is required for offline services");
    }

    if (
        finalMode === "ONLINE" &&
        !organization.integrations?.googleCalendar?.isConnected
    ) {
        throw new ApiError(400, "Please complete Google Calendar integration to set up online services");
    }

    try {
        await service.save();
    } catch (err) {
        console.error("Error updating service:", err);
        throw new ApiError(500, "An error occurred while updating the service, please try again.");
    }

    console.log(`Service updated| Name: ${service.name} (ID: ${service._id}) | Slug: ${service.slug}`);

    return service;
};











export const deleteServiceService = async (userId, serviceId) => {
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(400, "Invalid service ID");
    }

    const service = await findServiceById(serviceId);
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    const organization = await findOrganizationById(service.organization);
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
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(400, "Invalid service ID");
    }

    const service = await findServiceById(serviceId);
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    return service;
};







export const getOrganizationServicesService = async (orgId) => {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Invalid organization ID");
    }

    const organization = await findOrganizationById(orgId);
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    const services = await findServicesByOrganizationId(orgId);

    return services;
};









export const toggleServiceStatusService = async (serviceId) => {
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(400, "Invalid service ID");
    }

    const service = await findServiceById(serviceId, "_id name isActive mode address organization");
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    const organization = await findOrganizationById(service.organization, "integrations");
    if (!organization) {
        throw new ApiError(404, "Organization not found");
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
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(400, "Invalid service ID");
    }

    const service = await findServiceById(serviceId);
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

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
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(400, "Invalid service ID");
    }

    const service = await findServiceById(serviceId);
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    if (!service.isSlugStale) {
        throw new ApiError(400, "No syncronization required. Url is already up to date.");
    }

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









export const getPublicServiceUrlService = async (serviceId) => {
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(400, "Invalid service ID");
    }

    const service = await findServiceById(serviceId);
    if (!service) {
        throw new ApiError(404, "Service not found")
    };

    const organization = await findOrganizationById(service.organization);
    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    const publicUrl = `${env.CLIENT_URL}/book/${organization.slug}/${service.slug}`;

    console.log(`Public URL fetched for ${service.name} (ID: ${service._id}) | Public URL: ${publicUrl}`);

    return {
        success: true,
        publicUrl: publicUrl,
    };
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




