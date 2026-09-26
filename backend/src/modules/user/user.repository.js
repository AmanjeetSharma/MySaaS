import { User } from "./user.model.js";
import { Organization } from "../organization/organization.model.js";


export const getUserById = async (userId, selectFields) => {
    let query = User.findById(userId);
    if (selectFields) {
        query = query.select(selectFields);
    }
    return query;
};


export const getUserByEmail = async (email, selectFields) => {
    let query = User.findOne({ email });
    if (selectFields) {
        query = query.select(selectFields);
    }
    return query;
};


export const getUserByHashedToken = async (hashedToken, selectFields) => {
    let query = User.findOne({
        "resetPasswordToken": hashedToken,
        "resetPasswordExpiry": { $gt: Date.now() }
    });
    if (selectFields) {
        query = query.select(selectFields);
    }
    return query;
}


export const getUserByPhone = async (userId, phone, selectFields) => {
    let query = User.findOne({
        _id: { $ne: userId }, // Exclude the current user from the search (ne=not equal)
        $or: [
            { "phone.number": phone },
            { "phone.pendingNumber": phone }

        ]
    });
    if (selectFields) {
        query = query.select(selectFields);
    }
    return query;
};



export const updateUserSettingsField = async (userId, updateObj) => {
    return User.findByIdAndUpdate(
        userId,
        { $set: updateObj },
        { returnDocument: "after", runValidators: true } // after: return doc after update
    );
};



export const getOrganizationByUserId = async (userId) => {
    return Organization.findOne({ owner: userId });
};



export const deleteOrganization = async (organizationId) => {
    return Organization.findByIdAndDelete(organizationId);
};