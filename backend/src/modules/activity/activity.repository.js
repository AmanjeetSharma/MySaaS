import { User } from "../user/user.model.js";
import { Organization } from "../organization/organization.model.js";
import { Customer } from "../customer/customer.model.js";
import { Deal } from "../deal/deal.model.js";
import { Activity } from "./activity.model.js";


export const checkUserOrganizationMembership = (userId, orgId) => {
    return Organization.exists({
        _id: orgId,
        $or: [
            { owner: userId },
            { "members.user": userId }
        ]
    });
}


export const findDealById = (dealId) => {
    return Deal.findById(dealId);
}


export const createActivity = async (userId, payload) => {
    const activity = await Activity.create({
        ...payload,
        createdBy: userId
    });

    return activity.populate([
        { path: "createdBy", select: "name email" },
        { path: "customer", select: "name email" }
    ]);
};


export const updateActivity = (userId, activityId, updateData) => {
    return Activity.findOneAndUpdate(
        { _id: activityId, createdBy: userId },
        updateData,
        { new: true }
    );
};


export const findActivityById = (activityId) => {
    return Activity.findById(activityId);
}


export const deleteActivity = (activityId) => {
    return Activity.findByIdAndDelete({ _id: activityId });
}


export const findUserById = (userId, selectFields = "activeOrganization") => {
    return User.findById(userId).select(selectFields);
};


export const getActivityFeed = async ({
    organizationId,
    limit = 10,
    cursor = null
}) => {

    const query = {
        organization: organizationId
    };

    if (cursor) {
        query.createdAt = {
            $lt: cursor
        };
    }

    return Activity.find(query)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit)
        .select(
            "type customType event description createdAt customer deal createdBy"
        )
        .populate("customer", "name")
        .populate("deal", "title")
        .populate("createdBy", "name avatar.url")
        .lean();
};