import { User } from "./user.model.js";
import { Organization } from "../organization/organization.model.js";

export const getUserById = async (userId, selectFields) => {
    let query = User.findById(userId);
    if (selectFields) {
        query = query.select(selectFields);
    }
    return await query;
};

export const getUserByEmail = async (email, selectFields) => {
    let query = User.findOne({ email });
    if (selectFields) {
        query = query.select(selectFields);
    }
    return await query;
};

export const getUserByHashedToken = async (hashedToken, selectFields) => {
    let query = User.findOne({
        "resetPasswordToken": hashedToken,
        "resetPasswordExpiry": { $gt: Date.now() }
    });
    if (selectFields) {
        query = query.select(selectFields);
    }
    return await query;
}