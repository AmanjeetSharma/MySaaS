import { User } from "../user/user.model.js";
import { PendingUser } from "../user/pendingUser.model.js";
import { Organization } from "../organization/organization.model.js";


export const findUserByEmail = async (email) => {
    return await User.findOne({ email });
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



export const findPendingUserByVerificationToken = async (token) => {
    return await PendingUser.findOne({ verificationToken: token });
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