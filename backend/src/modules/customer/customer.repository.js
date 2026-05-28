import { Organization } from "../organization/organization.model";
import { Customer } from "./customer.model";


export const checkUserOrganizationMembership = async (userId, orgId) => {
    return await Organization.findOne({
        _id: orgId,
        $or: [
            { owner: userId },
            { "members.user": userId }
        ]
    }).lean();
}


export const findCustomerByName = async (orgId, name) => {
    return await Customer.findOne({
        organization: orgId,
        name: name,
        isDeleted: false
    }).lean();
}

export const findCustomerByEmail = async (orgId, email) => {
    return await Customer.findOne({
        organization: orgId,
        email: email,
        isDeleted: false
    }).lean();
}

export const findCustomerByPhone = async (orgId, phone) => {
    return await Customer.findOne({
        organization: orgId,
        phone: phone,
        isDeleted: false
    }).lean();
}

export const CreateCustomer = async (payload) => {
    return await Customer.create(payload);
}