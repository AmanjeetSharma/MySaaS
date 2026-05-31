import { Organization } from "../organization/organization.model.js";
import { Customer } from "./customer.model.js";


export const checkUserOrganizationMembership = (userId, orgId) => {
    return Organization.exists({
        _id: orgId,
        $or: [
            { owner: userId },
            { "members.user": userId }
        ]
    });
}


export const findCustomerByName = (orgId, name) => {
    return Customer.findOne({
        organization: orgId,
        name,
        isDeleted: false
    }).lean();
}


export const findCustomerByEmail = (orgId, email) => {
    return Customer.findOne({
        organization: orgId,
        email: email,
        isDeleted: false
    }).lean();
}


export const findCustomerByPhone = (orgId, phone) => {
    return Customer.findOne({
        organization: orgId,
        phone: phone,
        isDeleted: false
    }).lean();
}


export const createCustomer = (payload) => {
    return Customer.create(payload);
}


export const findCustomerById = (customerId) => {
    return Customer.findOne({
        _id: customerId,
        isDeleted: false
    });
}