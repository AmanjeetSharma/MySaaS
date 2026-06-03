import { User } from "../user/user.model.js";
import { Organization } from "../organization/organization.model.js";
import { Customer } from "../customer/customer.model.js";
import { Deal } from "./deal.model.js";


export const checkUserOrganizationMembership = (userId, orgId) => {
    return Organization.exists({
        _id: orgId,
        $or: [
            { owner: userId },
            { "members.user": userId }
        ]
    });
}


export const hasOrganizationAccess = (userId, orgId) => {
    return Organization.exists({
        _id: orgId,
        $or: [
            { owner: userId },
            { "members.user": userId }
        ]
    });
}


export const createDeal = (userId, orgId, customerId, title) => {
    return Deal.create({
        organization: orgId,
        customer: customerId,
        title,
        createdBy: userId
    });
}


export const findCustomerByIdInOrg = (customerId, orgId) => {
    return Customer.exists({
        _id: customerId,
        organization: orgId,
        isDeleted: false
    });
}

export const findDealById = (dealId) => {
    return Deal.findOne({
        _id: dealId,
        isDeleted: false
    });
}