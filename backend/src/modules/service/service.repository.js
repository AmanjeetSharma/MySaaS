import { Organization } from "../organization/organization.model.js";
import { Service } from "./service.model.js";
import { Availability } from "../availability/availability.model.js";

export const findIfSlugExists = async (orgId, slug) => {
    return Service.findOne({ organization: orgId, slug });
}


export const findOrganizationById = async (orgId, selectedFields) => {
    let query = Organization.findById(orgId);
    if (selectedFields) {
        query = query.select(selectedFields);
    }
    return query;
}


export const findServiceById = async (serviceId, selectedFields) => {
    let query = Service.findById(serviceId);
    if (selectedFields) {
        query = query.select(selectedFields);
    }
    return query;
}


export const createService = async (payload) => {
    return Service.create(payload);
}


export const deleteServiceById = async (serviceId) => {
    return Service.findByIdAndDelete(serviceId);
}


export const findServicesByOrganizationId = async (orgId) => {
    return Service.find({ organization: orgId });
}


export const findOrganizationBySlug = async (slug) => {
    return Organization.findOne({ slug });
}


export const findServiceBySlug = async (orgId, slug) => {
    return Service.findOne({ organization: orgId, slug });
}


export const findAvailabilityByServiceId = async (serviceId) => {
    return Availability.findOne({ service: serviceId });
}