import { User } from "./user.model.js";
import { Organization } from "../organization/organization.model.js";

export const getUserById = async (userId, selectFields) => {
    let query = User.findById(userId);
    if (selectFields) {
        query = query.select(selectFields);
    }
    return await query;
};

