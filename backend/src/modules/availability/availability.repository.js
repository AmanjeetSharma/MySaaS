import { Availability } from "./availability.model.js";
import { Service } from "../service/service.model.js";
import { Organization } from "../organization/organization.model.js";


export const findAvailabilityByServiceId = async (serviceId) => {
    return await Availability.findOne({ service: serviceId });
};


export const createAvailability = async (payload) => {
    return await Availability.create(payload);

};

export const updateAvailabilityById = async (availabilityId, payload) => {
    return await Availability.findByIdAndUpdate(
        availabilityId,
        payload,
        { new: true }
    );
};


export const findServiceById = async (serviceId, selectedFields) => {
    let query = Service.findById(serviceId);
    if (selectedFields) {
        query = query.select(selectedFields);
    }
    return await query;
};


export const findOrganizationById = async (orgId, selectedFields) => {
    let query = Organization.findById(orgId);
    if (selectedFields) {
        query = query.select(selectedFields);
    }
    return await query;
};


export const deleteAvailabilityByServiceId = async (serviceId) => {
    return await Availability.findOneAndDelete({ service: serviceId });
};