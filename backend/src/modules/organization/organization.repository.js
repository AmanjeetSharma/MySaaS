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
    return query;
};


export const findExistingOrganization = async (userId) => {
    return Organization.findOne({ owner: userId });
};


export const createOrganization = async (orgData, session = null) => {
    const org = new Organization(orgData);
    if (session) {
        return org.save({ session });
    }
    return org.save();
};


export const findOrganizationById = async (orgId, session, populateOptions = []) => {
    let query = Organization.findById(orgId);
    if (session) {
        query = query.session(session);
    }
    if (populateOptions.length > 0) {
        populateOptions.forEach(option => {
            query = query.populate(option);
        });
    }
    return query;
};


export const setActiveOrganization = async (userId, orgId, session = null) => {
    let query = User.findByIdAndUpdate(userId,
        { $set: { activeOrganization: orgId } },
        { returnDocument: "after" }
    );

    if (session) {
        query = query.session(session);
    }
    return query;
};


export const unsetActiveOrganizationForUsers = async (orgId, session) => {
    const query = User.updateMany(
        { activeOrganization: orgId },
        { $set: { activeOrganization: null } },
        { session }
    );
    return query;
};


export const deleteOrganizationById = async (orgId, session) => {
    let query = Organization.findByIdAndDelete(orgId);
    if (session) {
        query = query.session(session);
    }
    return query;
};


export const findOrganizationsByUserId = async (userId) => {
    return Organization.find({
        $or: [
            { owner: userId },
            { "members.user": userId }
        ]
    })
        .select("-__v")
        .sort({ createdAt: -1 });
};

