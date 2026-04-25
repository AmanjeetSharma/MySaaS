import { User } from "../user/user.model.js";
import { PendingUser } from "../user/pendingUser.model.js";
import { Organization } from "../organization/organization.model.js";


export const findUserByEmail = async (email, selectFields) => {
    let query = User.findOne({ email });
    if (selectFields) {
        query = query.select(selectFields);
    }
    return await query;
};

export const findPendingUserByEmail = async (email) => {
    return await PendingUser.findOne({ email });
};

export const createPendingUser = async (payload) => {
    return await PendingUser.create(payload);
};

export const savePendingUser = async (pendingUser) => {
    return await pendingUser.save();
};



export const findPendingUserByVerificationToken = async (token, selectFields) => {
    let query = PendingUser.findOne({ verificationToken: token });
    if (selectFields) {
        query = query.select(selectFields);
    }
    return await query;
};

export const createNewUserFromPending = async (payload) => {
    return await User.create(payload);
};

export const deletePendingUser = async (pendingUserId) => {
    return await PendingUser.findByIdAndDelete(pendingUserId);
}

export const createDefaultOrganization = async (payload) => {
    return await Organization.create(payload);
};



export const findUserById = async (id, selectFields) => {
    let query = User.findById(id);
    if (selectFields) {
        query = query.select(selectFields);
    }
    return await query;
};