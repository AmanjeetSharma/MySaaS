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


export const getOrganizationAccessStatus = async (userId, orgId) => {
    const org = await Organization.findById(orgId)
        .select("_id owner members.user")
        .lean();

    if (!org) {
        return {
            exists: false,
            hasAccess: false,
        };
    }

    const hasAccess =
        org.owner.toString() === userId.toString() ||
        org.members.some(
            member => member.user.toString() === userId.toString()
        );

    return {
        exists: true,
        hasAccess,
    };
};


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


export const findDealByIdWithPopulate = (dealId) => {
    return Deal.findOne({
        _id: dealId,
        isDeleted: false
    }).populate("customer", "name email phone")
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .lean();
}


export const findDeals = (filter, sort, skip, limit) => {
    return Deal.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("customer", "name email phone")
        .lean();
}


export const countDeals = (filter) => {
    return Deal.countDocuments(filter);
}


export const getDealStatistics = (filter) => {
    return Deal.aggregate([
        { $match: filter },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);
}
