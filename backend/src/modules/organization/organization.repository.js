import { User } from "../user/user.model.js";
import { Organization } from "./organization.model.js";

export const findUserById = async (userId, selectFields, session) => {
    let query = User.findById(userId);
    if (selectFields) {
        query = query.select(selectFields);
    }
    if (session) {
        query = query.session(session);
    }
    return await query;
};


export const findExistingOrganization = async (userId) => {
    return await Organization.findOne({ owner: userId });
};


export const createOrganization = async (orgData, session = null) => {
    const org = new Organization(orgData);
    if (session) {
        return await org.save({ session });
    }
    return await org.save();
};


export const findOrganizationById = async (orgId, session) => {
    let query = Organization.findById(orgId);
    if (session) {
        query = query.session(session);
    }
    return await query;
};


export const setActiveOrganization = async (userId, orgId, session = null) => {
    let query = User.findByIdAndUpdate(userId,
        { $set: { activeOrganization: orgId } },
        { returnDocument: "after" }
    );

    if (session) {
        query = query.session(session);
    }
    return await query;
};


export const setActiveOrganizationForUsers = async (orgId, session) => {
    const org = await User.updateMany(
        { activeOrganization: orgId },
        { $set: { activeOrganization: null } },
        { session }
    );
    return org;
};


export const deleteOrganizationById = async (orgId, session) => {
    let query = Organization.findByIdAndDelete(orgId);
    if (session) {
        query = query.session(session);
    }
    return await query;
};


export const findOrganizationsByUserId = async (userId) => {
    return await Organization.find({
        $or: [
            { owner: userId },
            { "members.user": userId }
        ]
    }).select("-__v").sort({ createdAt: -1 });
};