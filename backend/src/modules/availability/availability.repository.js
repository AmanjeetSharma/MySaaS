import { Availability } from "./availability.model.js";
import { Service } from "../service/service.model.js";
import { Organization } from "../organization/organization.model.js";


export const findAvailabilityByServiceId = async (serviceId) => {
    return Availability.findOne({ service: serviceId });
};


export const createAvailability = async (payload) => {
    return Availability.create(payload);

};

export const updateAvailabilityById = async (availabilityId, payload) => {
    return Availability.findByIdAndUpdate(
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
    return query;
};


export const findOrganizationById = async (orgId, selectedFields) => {
    let query = Organization.findById(orgId);
    if (selectedFields) {
        query = query.select(selectedFields);
    }
    return query;
};


export const deleteAvailabilityByServiceId = async (serviceId) => {
    return Availability.findOneAndDelete({ service: serviceId });
};