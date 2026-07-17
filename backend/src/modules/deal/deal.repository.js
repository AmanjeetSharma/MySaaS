import mongoose from "mongoose";
import { User } from "../user/user.model.js";
import { Organization } from "../organization/organization.model.js";
import { Customer } from "../customer/customer.model.js";
import { Deal } from "./deal.model.js";
import { Activity } from "../activity/activity.model.js";


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

export const findCustomerIdsForDealSearch = (orgId, safeSearch) => {
    return Customer.find({
        organization: orgId,
        isDeleted: false,
        $or: [
            { name: { $regex: safeSearch, $options: "i" } },
            { email: { $regex: safeSearch, $options: "i" } },
            { phone: { $regex: safeSearch, $options: "i" } }
        ]
    })
        .select("_id")
        .lean();
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
    const aggregationFilter = {
        ...filter,
        organization: new mongoose.Types.ObjectId(filter.organization)
    };

    return Deal.aggregate([
        { $match: aggregationFilter },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);
}


export const findDealActivities = async (dealId, cursor = null, limit = 11) => {
    const filter = { deal: dealId };

    if (cursor?.createdAt && cursor?._id) {
        filter.$or = [
            {
                createdAt: { $lt: new Date(cursor.createdAt) }
            },
            {
                createdAt: new Date(cursor.createdAt),
                _id: { $lt: cursor._id }
            }
        ];
    }

    return Activity.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit)
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .lean();
};
