import { User } from "../user/user.model.js";
import { PendingUser } from "../user/pendingUser.model.js";

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
    return await PendingUser.save();
};