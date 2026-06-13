import mongoose from "mongoose";
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


export const findCustomerByIdFull = (customerId) => {
    return Customer.findOne({
        _id: customerId,
        isDeleted: false
    })
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');
}


export const findCustomers = ({ filter, sort, skip, limit }) => {
    return Customer.find(filter)
        .collation({ locale: 'en', strength: 2 })// to make the sorting case-insensitive as in mongoDB, the default collation is case-sensitive which can lead to unexpected sorting results. By setting strength to 2, we ensure that the sorting is done in a case-insensitive manner. This means that "apple" and "Apple" will be considered equal for sorting purposes, and their order will be determined by their original order in the database.
        .sort(sort)
        .skip(skip)
        .limit(limit)
        // .populate('createdBy', 'name email') // Populate createdBy with name and email
        // .populate('updatedBy', 'name email') // to get the details of the user who last updated the customer
        .lean();
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
        .limit(limit)
        // .populate('createdBy', 'name email')
        // .populate('updatedBy', 'name email');
        .lean();
};


// Aggregation does not cast plain ids to ObjectId, so we need to convert them manually (its a common pitfall, spent hours debugging this)
// This was done to optimize the performance of the endpoint by reducing the number of queries to the database.
export const getDealStatistics = (filter) => {
    const aggregationFilter = {
        ...filter,
        organization: new mongoose.Types.ObjectId(filter.organization),
        customer: new mongoose.Types.ObjectId(filter.customer)
    };

    return Deal.aggregate([
        { $match: aggregationFilter },
        {
            $group: {
                _id: {
                    $toLower: { $trim: { input: "$status" } }
                },
                count: { $sum: 1 }
            }
        }
    ]);
};


export const getOrgDetails = (orgId) => {
    return Organization.findById(orgId).select('name');
}


export const updateCustomerUsageStats = async (orgId, value) => {
    return Organization.updateOne(
        { _id: orgId },
        {
            $inc: { "usage.customerCount": value }
        }
    );
}