import { Organization } from "../organization/organization.model.js";
import { Customer } from "./customer.model.js";
import { Deal } from "../deal/deal.model.js";
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


export const findCustomers = ({ filter, sort, skip, limit }) => {
    return Customer.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email') // Populate createdBy with name and email
        .populate('updatedBy', 'name email'); // to get the details of the user who last updated the customer
};


export const countCustomers = (filter) => {
    return Customer.countDocuments(filter);
};


export const findActivities = ({ filter, skip, limit, sort = { createdAt: -1 } }) => {
    return Activity.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
};


export const countActivities = (filter) => {
    return Activity.countDocuments(filter);
};


export const getActivitySummary = (filter) => {
    return Activity.aggregate([
        { $match: filter },
        {
            $group: {
                _id: null,
                totalActivities: { $sum: 1 },
                uniqueDeals: { $addToSet: "$deal" },
                byType: { $push: "$type" }
            }
        },
        {
            $project: {
                totalActivities: 1,
                uniqueDealsCount: { $size: "$uniqueDeals" },
                activityTypes: "$byType"
            }
        }
    ]);
};


export const findDeals = ({ filter, sort, skip, limit }) => {
    return Deal.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
    };


export const countDeals = (filter) => {
    return Deal.countDocuments(filter);
};


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
};